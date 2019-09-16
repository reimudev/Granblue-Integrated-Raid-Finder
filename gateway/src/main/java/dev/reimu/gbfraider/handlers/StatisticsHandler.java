package dev.reimu.gbfraider.handlers;

import java.time.LocalDateTime;

import dev.reimu.gbfraider.Utils;
import dev.reimu.gbfraider.handlers.PrefilterHandler.RequestAndParameters;
import io.netty.channel.ChannelHandler.Sharable;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.SimpleChannelInboundHandler;
import redis.clients.jedis.Jedis;

/**
 * Records how many times each bosses are queried 
 */
@Sharable
public class StatisticsHandler extends SimpleChannelInboundHandler<RequestAndParameters> {
	
	@Override
	public boolean acceptInboundMessage(Object msg) throws Exception {
		return true;
	}
	
	@Override
	protected void channelRead0(ChannelHandlerContext ctx, RequestAndParameters msg) throws Exception {
		String key = Utils.makeStatisticsCachekey(LocalDateTime.now());
		try (Jedis localJedis = Utils.makeJedisObject(1)) {
			localJedis.zincrby(key, 1, "boss:" + msg.getBossId());
		}
		ctx.fireChannelRead(msg);
	}
}