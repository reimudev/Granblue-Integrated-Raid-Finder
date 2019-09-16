package dev.reimu.gbfraider;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;
import java.util.Timer;
import java.util.TimerTask;
import java.util.concurrent.atomic.AtomicInteger;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.twitter.hbc.core.event.Event;

import dev.reimu.gbfraider.client.Boss;
import dev.reimu.gbfraider.client.TwitterClient;
import dev.reimu.gbfraider.client.Utils;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.Transaction;

public class Entry {
	
	private static final Logger logger = LoggerFactory.getLogger("twitter");
	private static final int maxListLength = Integer.parseInt(ProgramProperties.getString("redis.maxlen"));
	private static final int bossListCheckingInterval = ProgramProperties.getInt("bosses.check_interval");
	private static final int eventBossMaxId = ProgramProperties.getInt("bosses.event_boss_max_id");
	private static TwitterClient client;
	
	private static final ThreadLocal<Jedis> threadLocalJedis = new ThreadLocal<Jedis>() {
		protected Jedis initialValue() {
			return connect();
		};
		public Jedis get() {
			Jedis jd = super.get();
			if(jd!=null && jd.isConnected()) {
				return jd;
			}
			super.set(null);
			jd = connect();
			super.set(jd);
			return jd;
		};
		
		private Jedis connect() {
			Jedis con;
			try {
				System.out.println("redis uri is:"+new URI(ProgramProperties.getString("redis.uri")));
				con = new Jedis(new URI(ProgramProperties.getString("redis.uri")));
			} catch (URISyntaxException e) {
				throw new RuntimeException(e);
			}
			con.connect();
			String pwd = ProgramProperties.getString("redis.passwd");
			if(pwd!=null && pwd.length()>0) {
				con.auth(ProgramProperties.getString("redis.passwd"));
			}
			return con;
		}
	};
	
	private static final AtomicInteger redisExceptionCount = new AtomicInteger(0);
	private static final int maxRedisFailureCount = ProgramProperties.getInt("redis.max_failure_count");
	private static Jedis tryGetRedisConnection() {
		if(redisExceptionCount.get()>=maxRedisFailureCount) {
			logger.error("redis cannot be reached, abort operation");
			throw new RuntimeException("max failure reached");
		}
		try {
			Jedis jd = threadLocalJedis.get();
			return jd;
		} catch (Exception e) {
			logger.error("redis connection failure:"+redisExceptionCount.incrementAndGet());
			throw e;
		}
	}
	
	private static final class TwitterClientImpl extends TwitterClient{
		public TwitterClientImpl(List<Boss> bossesToTrack) {
			super(bossesToTrack,ProgramProperties.getString("twitter.apikey"));
		}

		@Override
		public void onEvent(Event event) {
			switch(event.getEventType()) {
			case DISCONNECTED:
			case STOPPED_BY_ERROR:
			case HTTP_ERROR:
				logger.error("critical error: "+event.getEventType() + " " + event.getMessage() + " " + event.getUnderlyingException());
			default:
				return;
			}
		}
		
		@Override
		public void onBoss(Boss boss, Tweet tweet) {
			Jedis jd = tryGetRedisConnection();
			Transaction tx = jd.multi();
			String text = tweet.getUserName()+","+tweet.getTimestamp()+","+tweet.getID()+","+tweet.getTweetContent();
			tx.lpush("boss:"+boss.id, text);
			//右侧闭区间，需要-1
			tx.ltrim("boss:"+boss.id, 0, maxListLength-1);
			tx.incr("bosstotal");
			//用来检测服务器是否停机
			List<Object> ret = tx.exec();
			if(ret==null || ret.isEmpty()) {
				logger.error("redis insertion failed:"+boss);
				return;
			}
		}
	}
	
	public static void main(String[] args) throws MalformedURLException, IOException {
		
		List<Boss> bossList = Utils.retrieveBossList();
		client = new TwitterClientImpl(new ArrayList<>(bossList));
		client.start();
		
		//check boss list update periodically
		Timer timer = new Timer("check_boss_list_update");
		TimerTask task = new TimerTask() {
			
			@Override
			public void run() {
				logger.info("checking boss list update");
				List<Boss> mayBeUpdated;
				try {
					mayBeUpdated = Utils.retrieveBossList();
					if(mayBeUpdated.equals(bossList))
						return;
				} catch (IOException e) {
					logger.error("check boss list update failed",e);
					return;
				}
				try {
					logger.info("update boss list");
					client.close();
					
					//remove old data
					Jedis jd = tryGetRedisConnection();
					Transaction tx = jd.multi();
					for(int i=0;i<=eventBossMaxId;++i) {
						tx.del("boss:"+i);
					}
					tx.exec();
					
					bossList.clear();
					bossList.addAll(mayBeUpdated);
					client = new TwitterClientImpl(new ArrayList<>(bossList));
					client.start();
				} catch (Exception e) {
					logger.error("check boss list update error"+e.getMessage(),e);
				}
			}
		};
		timer.scheduleAtFixedRate(task, bossListCheckingInterval, bossListCheckingInterval);
		
		Runtime.getRuntime().addShutdownHook(new Thread() {
			@Override
			public void run() {
				try {
					client.close();
					timer.cancel();
				} catch (Exception e) {
					e.printStackTrace();
				}
			}
		});
	}
}
