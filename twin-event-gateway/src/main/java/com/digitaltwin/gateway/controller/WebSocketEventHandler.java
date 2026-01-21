package com.digitaltwin.gateway.controller;

import com.digitaltwin.common.dto.EventRequest;
import com.digitaltwin.common.dto.EventResponse;
import com.digitaltwin.common.dto.StreamUpdate;
import com.digitaltwin.gateway.service.EventIngestionService;
import com.digitaltwin.gateway.service.StreamingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.socket.WebSocketHandler;
import org.springframework.web.reactive.socket.WebSocketMessage;
import org.springframework.web.reactive.socket.WebSocketSession;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * WebSocket handler for bidirectional real-time communication
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketEventHandler implements WebSocketHandler {
    
    private final EventIngestionService eventIngestionService;
    private final StreamingService streamingService;
    private final ObjectMapper objectMapper;
    
    @Override
    public Mono<Void> handle(WebSocketSession session) {
        String sessionId = session.getId();
        log.info("WebSocket connection established: {}", sessionId);
        
        // Extract twin ID from query params or headers
        String twinId = extractTwinId(session);
        
        // Handle incoming messages (events from client)
        Flux<EventResponse> incomingHandler = session.receive()
            .filter(msg -> msg.getType() == WebSocketMessage.Type.TEXT)
            .flatMap(msg -> parseAndProcessEvent(msg.getPayloadAsText()))
            .doOnError(e -> log.error("Error processing WebSocket message", e));
        
        // Send outgoing updates (stream updates to client)
        Flux<WebSocketMessage> outgoingUpdates = streamingService
            .subscribeToUpdates(twinId)
            .map(update -> {
                try {
                    return session.textMessage(objectMapper.writeValueAsString(update));
                } catch (Exception e) {
                    log.error("Error serializing update", e);
                    return session.textMessage("{}");
                }
            });
        
        // Combine incoming processing with outgoing streaming
        return session.send(outgoingUpdates)
            .and(incomingHandler.then())
            .doFinally(signal -> {
                log.info("WebSocket connection closed: {} - {}", sessionId, signal);
                streamingService.unsubscribe(sessionId);
            });
    }
    
    private String extractTwinId(WebSocketSession session) {
        String query = session.getHandshakeInfo().getUri().getQuery();
        if (query != null && query.contains("twinId=")) {
            return query.split("twinId=")[1].split("&")[0];
        }
        return "*"; // Subscribe to all updates
    }
    
    private Mono<EventResponse> parseAndProcessEvent(String payload) {
        try {
            EventRequest request = objectMapper.readValue(payload, EventRequest.class);
            return eventIngestionService.ingestEvent(request);
        } catch (Exception e) {
            log.error("Failed to parse event: {}", payload, e);
            return Mono.empty();
        }
    }
}
