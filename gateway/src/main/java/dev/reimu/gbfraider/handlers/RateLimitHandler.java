package dev.reimu.gbfraider.handlers;

import static io.netty.handler.codec.http.HttpVersion.HTTP_1_1;

import java.util.Arrays;

import dev.reimu.gbfraider.ProgramProperties;
import dev.reimu.gbfraider.Utils;
import io.netty.channel.ChannelFutureListener;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.SimpleChannelInboundHandler;
import io.netty.channel.ChannelHandler.Sharable;
import io.netty.handler.codec.http.DefaultFullHttpResponse;
import io.netty.handler.codec.http.FullHttpResponse;
import io.netty.handler.codec.http.HttpResponseStatus;
import redis.clients.jedis.Jedis;

@Sharable
public class RateLimitHandler extends SimpleChannelInboundHandler<Object> {
	
	private final String period = ProgramProperties.getString("ratelimit.period");
	private final String portion = ProgramProperties.getString("ratelimit.portion");
	
	private final String script =
			"if redis.call('setnx',KEYS[1],ARGV[1])==0 then return redis.call('decr',KEYS[1]); else redis.call('pexpire',KEYS[1],ARGV[2]); end;"
			+ " return redis.call('decr',KEYS[1]);";
	
	@Override
	public boolean acceptInboundMessage(Object msg) throws Exception {
		return true;
	}

	@Override
	protected void channelRead0(ChannelHandlerContext ctx, Object msg) throws Exception {
		String key = Utils.getIpAddress(ctx);
		try(Jedis localJedis = Utils.makeJedisObject(2)){
			Object ret = localJedis.eval(script,Arrays.asList(key),Arrays.asList(portion,period));
			if(((Number)ret).intValue()<0) {
				localJedis.incr("overlimit:"+key);
				//访问过于频繁
				FullHttpResponse response = new DefaultFullHttpResponse(
						HTTP_1_1, new HttpResponseStatus(429, "Too Many Requests"));
				ctx.writeAndFlush(response).addListener(ChannelFutureListener.CLOSE);
				Utils.releaseNettyObjectNoMatterWhat(response);
				return;
			}
		}
		ctx.fireChannelRead(msg);
	}
}
