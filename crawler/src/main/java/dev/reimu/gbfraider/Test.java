package dev.reimu.gbfraider;

import java.io.IOException;

import dev.reimu.gbfraider.client.TwitterClient.Tweet;
import dev.reimu.gbfraider.client.Utils;

public class Test {
	
	public static void main(String[] args) throws IOException {
		Tweet tw = new Tweet();
		Utils.parseTweet("83b5b8c2 :参戦ID\n" + 
				"参加者募集！\n" + 
				"Lv120 メタトロン", Utils.retrieveBossList(), tw);
		System.out.println(tw);
	}
}
