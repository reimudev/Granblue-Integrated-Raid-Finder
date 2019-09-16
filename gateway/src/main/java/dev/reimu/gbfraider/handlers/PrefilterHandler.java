package dev.reimu.gbfraider.handlers;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import dev.reimu.gbfraider.ProgramProperties;
import dev.reimu.gbfraider.Utils;
import io.netty.channel.ChannelHandler.Sharable;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.SimpleChannelInboundHandler;
import io.netty.handler.codec.http.HttpRequest;
import io.netty.handler.codec.http.QueryStringDecoder;
import redis.clients.jedis.Jedis;

/**
 * Validate request uri and content
 */
@Sharable
public class PrefilterHandler extends SimpleChannelInboundHandler<Object> {
	
	private static final Logger logger = LoggerFactory.getLogger("gateway");
	private static final String expectedHost = Utils.ip+":"+ProgramProperties.getInt("port");
	private static final DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy:MM:dd");
	
	public static final class RequestAndParameters{
		private HttpRequest request;
		private int b;
		public HttpRequest getRequest() {
			return request;
		}
		public int getBossId() {
			return b;
		}
	}
	
	@Override
	public boolean acceptInboundMessage(Object msg) throws Exception {
		return true;
	}

	@Override
	protected void channelRead0(ChannelHandlerContext ctx, Object msg) throws Exception {
		
		if(!(msg instanceof HttpRequest)) {
			logger.warn("unexpected:"+msg);
			ctx.close();
        	return;
		}
		
        HttpRequest request = (HttpRequest) msg;
        String host = request.headers().get("Host");
        if(!expectedHost.equals(host)) {
        	logger.warn("invalid host:"+Utils.getIpAddress(ctx)+", "+host+", expected:"+expectedHost);
        	ctx.close();
        	return;
        }
        String uri = request.getUri();
        if(uri.length()>256) {
        	logger.warn("uri too long:"+Utils.getIpAddress(ctx)+","+uri.substring(0, 256));
        	ctx.close();
        	return;
        }
        
        int idx = uri.indexOf('?');
        if(idx==-1) {
        	//非法请求
        	ctx.close();
        	return;
        }
        String path = uri.substring(0,idx);
        String queryString = uri.substring(idx);
        
        if( ! path.equals("/r")) {
        	//请求地址不对
        	ctx.close();
        	return;
        }
        
        QueryStringDecoder queryStringDecoder = new QueryStringDecoder(queryString);
        Map<String, List<String>> params = queryStringDecoder.parameters();
        List<String> bl = params.get("b");
        if(bl==null || bl.size()!=1) {
        	logger.warn("more than 1 param"+Utils.getIpAddress(ctx)+","+params);
        	ctx.close();
        	return;
        }
        String bossId = bl.get(0);
        int id = 0;
        try {
        	id = Integer.parseInt(bossId);
        }catch(Exception e) {
        	logger.warn("invalid boss id:"+Utils.getIpAddress(ctx)+","+bossId);
        	ctx.close();
        	return;
        }
        
        RequestAndParameters wrapper = new RequestAndParameters();
        
        wrapper.request = request;
        wrapper.b = id;
        
        try(Jedis localJedis = Utils.makeJedisObject(1)) {
        	localJedis.incr("access:count");
    		localJedis.incr("access:count:"+LocalDate.now().format(fmt));
        	ctx.fireChannelRead(wrapper);
        }
	}
}
