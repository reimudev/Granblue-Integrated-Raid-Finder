
package dev.reimu.gbfraider;

import java.util.concurrent.TimeUnit;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.netty.bootstrap.ServerBootstrap;
import io.netty.channel.Channel;
import io.netty.channel.ChannelOption;
import io.netty.channel.EventLoopGroup;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.nio.NioServerSocketChannel;

public class Server {

	private final static Logger logger = LoggerFactory.getLogger("gateway");
    private final int port;
    private final String host;
    
    private EventLoopGroup bossGroup;
    private EventLoopGroup workerGroup;

    public Server(String host, int port) {
        this.port = port;
        this.host = host;
    }

    public void run() throws Exception {
        EventLoopGroup bossGroup = new NioEventLoopGroup();
        EventLoopGroup workerGroup = new NioEventLoopGroup(ProgramProperties.getInt("threads"));
        this.bossGroup = bossGroup;
        this.workerGroup = workerGroup;
        try {
            ServerBootstrap b = new ServerBootstrap();
            b.group(bossGroup, workerGroup)
             .channel(NioServerSocketChannel.class)
             .childOption(ChannelOption.CONNECT_TIMEOUT_MILLIS, 10000)
             .childHandler(new Initializer())
             ;
            
            logger.info("gateway server started on port:"+port);
            logger.info("redis connection available:"+Utils.pool.getNumIdle());
            
            Channel ch = b.bind(host,port).sync().channel();
            ch.closeFuture().sync();
        } finally {
            bossGroup.shutdownGracefully();
            workerGroup.shutdownGracefully();
        }
    }
    
    public void close() throws Exception{
    	bossGroup.shutdownGracefully(2, 3, TimeUnit.SECONDS).get();
    	workerGroup.shutdownGracefully(2,3,TimeUnit.SECONDS).get();
    }
}
