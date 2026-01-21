package com.digitaltwin.gateway.config;

import com.digitaltwin.gateway.controller.WebSocketEventHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.HandlerMapping;
import org.springframework.web.reactive.handler.SimpleUrlHandlerMapping;
import org.springframework.web.reactive.socket.server.support.WebSocketHandlerAdapter;

import java.util.Map;

/**
 * WebSocket configuration
 */
@Configuration
@RequiredArgsConstructor
public class WebSocketConfig {
    
    private final WebSocketEventHandler webSocketEventHandler;
    
    @Bean
    public HandlerMapping webSocketHandlerMapping() {
        Map<String, Object> urlMap = Map.of(
            "/ws/events", webSocketEventHandler,
            "/ws/twins/**", webSocketEventHandler
        );
        
        SimpleUrlHandlerMapping mapping = new SimpleUrlHandlerMapping();
        mapping.setUrlMap(urlMap);
        mapping.setOrder(-1); // Before other handlers
        return mapping;
    }
    
    @Bean
    public WebSocketHandlerAdapter handlerAdapter() {
        return new WebSocketHandlerAdapter();
    }
}
