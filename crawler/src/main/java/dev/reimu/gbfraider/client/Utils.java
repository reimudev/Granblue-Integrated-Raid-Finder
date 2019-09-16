package dev.reimu.gbfraider.client;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.net.URLConnection;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.databind.ObjectMapper;

import dev.reimu.gbfraider.ProgramProperties;
import dev.reimu.gbfraider.client.TwitterClient.Tweet;

public class Utils {
	@SuppressWarnings("unchecked")
	public static List<Boss> retrieveBossList() throws IOException{
		URLConnection conn = new URL(
				ProgramProperties.getString(
				"bosses.raw")+"?t="+System.currentTimeMillis()).openConnection();
		InputStream in = conn.getInputStream();
		ByteArrayOutputStream baos = new ByteArrayOutputStream();
		byte[] buffer = new byte[1024];
		int read = -1;
		while((read = in.read(buffer))!=-1) {
			baos.write(buffer,0,read);
		}
		
		String json = new String(baos.toByteArray(),StandardCharsets.UTF_8);
		Map<String,Object> converted = new ObjectMapper().readValue(json, Map.class);
		List<Map<String,Object>> list = (List<Map<String,Object>>)converted.get("list");
		List<Boss> bosses = new ArrayList<>();
		for(Map<String,Object> item:list) {
			bosses.add(new Boss(
					((Number)item.get("id")).intValue(),
					((Number)item.get("level")).intValue(),
					(String)((Map<String,Object>)item.get("names")).get("en"),
					(String)((Map<String,Object>)item.get("names")).get("jpn")
					));
		}
		return bosses;
	}
	
	public static Boss parseTweet(String text, List<Boss> bosses, Tweet out) {
		Boss found = null;
		String ID = null;
		String tweetContent = null;
		for(Boss boss:bosses) {
			if(boss.beThisBoss(text)) {
				//可能会漏掉推文里本身就有:号的求援信息
				//不能用lastIndexOf，因为本身有一个https://xxx在里面
				int idx = text.indexOf(":参戦ID");
				if(idx==-1 || idx<9) {
					idx = text.indexOf(":Battle ID");
				}
				if(idx==-1 || idx<9) {
					throw new IllegalArgumentException("invalid:"+text);
				}
				found = boss;
				ID = text.substring(idx-9, idx-1);
				tweetContent = text.substring(0,idx-9);
				break;
			}
		}
		if(found==null) {
			throw new IllegalArgumentException("unknown:"+text);
		}
		if( ! isValidID(ID)) {
			throw new IllegalArgumentException("invalid ID:"+text);
		}
		out.ID = ID;
		out.tweetContent = tweetContent;
		return found;
	}
	
	private static boolean isValidID(String ID) {
		for(int i=0;i<ID.length();++i) {
			char c = ID.charAt(i);
			if(!((c>='0' && c<='9') || (c>='A' && c<='Z'))){
				return false;
			}
		}
		return true;
	}
}
