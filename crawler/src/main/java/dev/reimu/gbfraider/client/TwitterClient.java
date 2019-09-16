package dev.reimu.gbfraider.client;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.twitter.hbc.ClientBuilder;
import com.twitter.hbc.core.Client;
import com.twitter.hbc.core.Constants;
import com.twitter.hbc.core.HttpHosts;
import com.twitter.hbc.core.endpoint.StatusesFilterEndpoint;
import com.twitter.hbc.core.event.Event;
import com.twitter.hbc.core.processor.StringDelimitedProcessor;
import com.twitter.hbc.httpclient.auth.Authentication;
import com.twitter.hbc.httpclient.auth.OAuth1;

public abstract class TwitterClient implements AutoCloseable{
	
	private final Logger logger = LoggerFactory.getLogger("twitter");
	
	private final BlockingQueue<String> msgQueue = new LinkedBlockingQueue<String>(128);
	private final BlockingQueue<Event> eventQueue = new LinkedBlockingQueue<Event>(128);
	private List<Boss> bosses;
	private Client client;
	private ObjectMapper om = new ObjectMapper();
	private final ExecutorService threadPool = Executors.newFixedThreadPool(4);
	
	public TwitterClient(List<Boss> bossesToTrack,String apiKeyTuple){
		this.bosses = bossesToTrack;
		
		StatusesFilterEndpoint hosebirdEndpoint = new StatusesFilterEndpoint();
		List<String> terms = new ArrayList<>();
		for(Boss boss:bosses) {
			terms.addAll(boss.lvlAndNames);
			logger.info("terms: "+boss.lvlAndNames);
		}
		hosebirdEndpoint.trackTerms(terms);
		String[] tuple = apiKeyTuple.split(",");
		Authentication hosebirdAuth = new OAuth1(tuple[0],tuple[1],tuple[2],tuple[3]);

		ClientBuilder builder =
				new ClientBuilder()
				.hosts(new HttpHosts(Constants.STREAM_HOST)).authentication(hosebirdAuth).endpoint(hosebirdEndpoint)
				.processor(new StringDelimitedProcessor(msgQueue))
				.eventMessageQueue(eventQueue);
		this.client = builder.build();
	}
	
	public void start() {
		threadPool.submit(new TwitterTask());
		threadPool.submit(new TwitterTask());
		threadPool.submit(new TwitterTask());
		threadPool.submit(new EventTask());
		client.connect();
	}
	
	@Override
	public void close() throws Exception {
		this.client.stop();
		threadPool.shutdownNow();
	}
	
	public abstract void onBoss(Boss boss,Tweet tweet);
	public abstract void onEvent(Event event);
	
	public static class Tweet{
		String userName;
		String ID;
		long timestamp;
		String tweetContent;
		public String getUserName() {
			return userName;
		}
		public String getID() {
			return ID;
		}
		public long getTimestamp() {
			return timestamp;
		}
		public String getTweetContent() {
			return tweetContent;
		}
		@Override
		public String toString() {
			return "Tweet [userName=" + userName + ", ID=" + ID + ", timestamp=" + timestamp + ", tweetContent="
					+ tweetContent + "]";
		}
	}
	
	private class TwitterTask implements Runnable{

		@SuppressWarnings("unchecked")
		@Override
		public void run() {
			Tweet tweet = new Tweet();
			while (!client.isDone()) {
				try {
					String msg = msgQueue.take();
					Map<String,Object> object = null;
					try {
						object = om.readValue(msg, Map.class);
					} catch (IOException e) {
						logger.error("",e);
						break;
					}
					
					String userName = (String) ((Map<String,Object>)object.get("user")).get("screen_name");
					long timestamp = Long.parseLong((String) object.get("timestamp_ms"));
					tweet.userName = userName;
					tweet.timestamp = timestamp;
					
					String text = (String) object.get("text");
					Boss found;
					try {
						found = Utils.parseTweet(text, bosses, tweet);
					} catch (Exception e) {
						logger.warn(e.getMessage());
						continue;
					}
					TwitterClient.this.onBoss(found,tweet);
				} catch (InterruptedException ie) {
					logger.error("",ie);
					break;
				} catch (Exception e) {
					logger.error("",e);
					continue;
				}
			}
		}
	}
	private class EventTask implements Runnable{
		@Override
		public void run() {
			try {
				Event evt = eventQueue.take();
				TwitterClient.this.onEvent(evt);
			} catch (Exception e) {
				logger.error("",e);
			}
		}
	}
}