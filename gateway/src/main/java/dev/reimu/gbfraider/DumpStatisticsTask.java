package dev.reimu.gbfraider;

import java.sql.SQLException;
import java.util.List;
import java.util.Set;
import java.util.TimerTask;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import dev.reimu.gbfraider.Utils.StatRecord;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.Transaction;
import redis.clients.jedis.Tuple;

public class DumpStatisticsTask extends TimerTask{
	
	private static final Logger logger = LoggerFactory.getLogger("statistics");
	
	@Override
	public void run() {
		try(Jedis con = Utils.makeJedisObject(1)){
			//statistics:yyyy:MM:dd:HH:[0-5]
			logger.info("statistics task started");
			Set<String> keys = con.keys(Utils.statisticsPrefix+"*");
			StatRecord record = new StatRecord();
			for(String key:keys) {
				logger.info("found: "+key);
				String[] parts = key.split(":");
				String dt = parts[1] +"-"+parts[2]+"-"+parts[3];
				int h = Integer.parseInt(parts[4]);
				int sec = Integer.parseInt(parts[5]);
				//key of past days
				Transaction trx = con.multi();
				trx.zrangeWithScores(key, 0, 1000000);
				trx.del(key);
				List<Object> results = trx.exec();
				@SuppressWarnings("unchecked")
				Set<Tuple> result = (Set<Tuple>) results.get(0);
				for(Tuple tuple:result) {
					//boss:xx
					String tmp = tuple.getElement();
					int boss = Integer.parseInt(tmp.substring("boss:".length()));
					int score = (int) tuple.getScore();
					record.dt = dt;
					record.h = h;
					record.sec = sec;
					record.boss = boss;
					record.cnt = score;
					Utils.saveOrUpdateStatRecord(record);
				}
			}
			logger.info("statistics task completed");
		} catch (SQLException e) {
			logger.error("",e);
		}
	}
}
