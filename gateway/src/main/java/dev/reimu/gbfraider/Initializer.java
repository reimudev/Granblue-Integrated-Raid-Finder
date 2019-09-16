package dev.reimu.gbfraider;

import dev.reimu.gbfraider.handlers.PrefilterHandler;
import dev.reimu.gbfraider.handlers.RateLimitHandler;
import dev.reimu.gbfraider.handlers.RequestHandler;
import dev.reimu.gbfraider.handlers.StatisticsHandler;
import io.netty.channel.ChannelInitializer;
import io.netty.channel.ChannelPipeline;
import io.netty.channel.socket.SocketChannel;
import io.netty.handler.codec.http.HttpContentCompressor;
import io.netty.handler.codec.http.HttpObjectAggregator;
import io.netty.handler.codec.http.HttpRequestDecoder;
import io.netty.handler.codec.http.HttpResponseEncoder;

public class Initializer extends ChannelInitializer<SocketChannel> {
	
	PrefilterHandler pref = new PrefilterHandler();
	RateLimitHandler ratelim = new RateLimitHandler();
	StatisticsHandler statis = new StatisticsHandler();
	RequestHandler reqh = new RequestHandler();
	
    @Override
    public void initChannel(SocketChannel ch) throws Exception {
        ChannelPipeline p = ch.pipeline();
        p.addLast("decoder", new HttpRequestDecoder());
        p.addLast("aggregator", new HttpObjectAggregator(1048576));
        p.addLast("encoder", new HttpResponseEncoder());
        p.addLast("deflater", new HttpContentCompressor());
        p.addLast("prefilter",pref);
        p.addLast("ratelimit",ratelim);
        p.addLast("statistics",statis);
        p.addLast("handler",reqh);
    }
}
