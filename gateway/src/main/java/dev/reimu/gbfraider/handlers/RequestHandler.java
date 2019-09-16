package dev.reimu.gbfraider.handlers;

import static io.netty.handler.codec.http.HttpResponseStatus.OK;
import static io.netty.handler.codec.http.HttpVersion.HTTP_1_1;

import java.io.IOException;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import dev.reimu.gbfraider.ProgramProperties;
import dev.reimu.gbfraider.Utils;
import dev.reimu.gbfraider.handlers.PrefilterHandler.RequestAndParameters;
import io.netty.buffer.ByteBuf;
import io.netty.buffer.Unpooled;
import io.netty.channel.ChannelFuture;
import io.netty.channel.ChannelHandler.Sharable;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.SimpleChannelInboundHandler;
import io.netty.handler.codec.DecoderResult;
import io.netty.handler.codec.http.DefaultFullHttpResponse;
import io.netty.handler.codec.http.FullHttpResponse;
import io.netty.handler.codec.http.HttpHeaders;
import io.netty.handler.codec.http.HttpRequest;
import io.netty.util.CharsetUtil;
import redis.clients.jedis.Jedis;

@Sharable
public class RequestHandler extends SimpleChannelInboundHandler<RequestAndParameters> {

    private static final Logger logger = LoggerFactory.getLogger("gateway");
    private static final ObjectMapper om = new ObjectMapper();
    private static final int maxReturnLength = ProgramProperties.getInt("maxreturnlength");
	
	@Override
	public boolean acceptInboundMessage(Object msg) throws Exception {
		return true;
	}

    @Override
    public void channelReadComplete(ChannelHandlerContext ctx) throws Exception {
        ctx.flush();
    }

    @Override
    protected void channelRead0(ChannelHandlerContext ctx, RequestAndParameters msg) {
    	
        StringBuilder buf = new StringBuilder();
    	Map<String,Object> retJson = new HashMap<>();
    	
        try(Jedis jd = Utils.makeJedisObject(0)){
        	List<String> data = jd.lrange("boss:"+msg.getBossId(), 0, maxReturnLength-1);
        	String ts = jd.get("server:ts");
        	data = data == null ? Collections.emptyList() : data;
        	retJson.put("data", data);
        	//可能请求会在TwitterClient尚未完成任何请求时就发出
        	retJson.put("ts", ts == null ? System.currentTimeMillis() : Long.parseLong(ts));
        	
        	try {
        		buf.append(om.writeValueAsString(retJson));
        	} catch (JsonProcessingException e) {
        		throw new Error(e);
        	}
        }
        
        appendDecoderResult(msg.getRequest(),buf);
        ByteBuf content = Unpooled.copiedBuffer(buf.toString(), CharsetUtil.UTF_8);
        writeResponse(content,ctx);
        Utils.releaseNettyObjectNoMatterWhat(content);
    }

    private void appendDecoderResult(HttpRequest request, StringBuilder buf) {
        DecoderResult result = request.getDecoderResult();
        if (result.isSuccess()) {
            return;
        }
        logger.error("decoder failed:"+result.cause().getMessage(),result.cause());
        throw new RuntimeException("decoder failed:");
    }

    private ChannelFuture writeResponse(ByteBuf content, ChannelHandlerContext ctx) {
        FullHttpResponse response = new DefaultFullHttpResponse(HTTP_1_1, OK,content);
        HttpHeaders headers = response.headers();
        headers.set(HttpHeaders.Names.CONTENT_TYPE, "application/json; charset=UTF-8");
        headers.set(HttpHeaders.Names.ACCESS_CONTROL_ALLOW_ORIGIN,"*");
        headers.set(HttpHeaders.Names.ACCESS_CONTROL_ALLOW_METHODS,"GET");
        headers.set(HttpHeaders.Names.ACCESS_CONTROL_ALLOW_HEADERS,"*");
        headers.set(HttpHeaders.Names.ACCESS_CONTROL_ALLOW_CREDENTIALS,"true");
        return ctx.writeAndFlush(response);
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception {
    	if(cause instanceof IOException) {
    		logger.error("caught io exception:"+cause.getMessage());
    	}else {
    		logger.error("caught exception:"+cause.getMessage(),cause);
    	}
        ctx.close();
    }
}
