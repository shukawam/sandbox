package me.shukawam.oci;

import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.logging.Logger;

import org.eclipse.microprofile.config.inject.ConfigProperty;

import com.oracle.bmc.ClientConfiguration;
import com.oracle.bmc.auth.InstancePrincipalsAuthenticationDetailsProvider;
import com.oracle.bmc.queue.QueueAdminClient;
import com.oracle.bmc.queue.QueueClient;
import com.oracle.bmc.queue.model.GetMessage;
import com.oracle.bmc.queue.model.PutMessagesDetails;
import com.oracle.bmc.queue.model.PutMessagesDetailsEntry;
import com.oracle.bmc.queue.model.QueueSummary;
import com.oracle.bmc.queue.requests.GetMessagesRequest;
import com.oracle.bmc.queue.requests.ListQueuesRequest;
import com.oracle.bmc.queue.requests.PutMessagesRequest;
import com.oracle.bmc.queue.responses.GetMessagesResponse;
import com.oracle.bmc.queue.responses.ListQueuesResponse;
import com.oracle.bmc.queue.responses.PutMessagesResponse;
import com.oracle.bmc.retrier.RetryConfiguration;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

@ApplicationScoped
public class QueueService {
    private static final Logger logger = Logger.getLogger(QueueService.class.getName());
    private final InstancePrincipalsAuthenticationDetailsProvider provider;
    private final QueueAdminClient adminClient;
    private final QueueClient queueClient;
    private final String queueId;
    private final String compartmentId;
    private final String endpoint;

    /**
     * Constructor.
     */
    @Inject
    public QueueService(@ConfigProperty(name = "oci.queue.id") String queueId,
            @ConfigProperty(name = "oci.compartment-id") String compartmentId,
            @ConfigProperty(name = "oci.queue.endpoint") String endpoint) {
        this.queueId = queueId;
        this.compartmentId = compartmentId;
        this.endpoint = endpoint;
        provider = InstancePrincipalsAuthenticationDetailsProvider
                .builder()
                .build();
        adminClient = QueueAdminClient
                .builder()
                .build(provider);
        ClientConfiguration clientConfiguration = ClientConfiguration
                .builder()
                .build();
        queueClient = QueueClient.builder()
                .endpoint(endpoint)
                .configuration(clientConfiguration)
                .build(provider);
    }

    public List<QueueSummary> listQueues() {
        ListQueuesRequest listQueuesRequest = ListQueuesRequest.builder().compartmentId(compartmentId).build();
        ListQueuesResponse listQueuesResponse = adminClient.listQueues(listQueuesRequest);
        return listQueuesResponse.getQueueCollection().getItems();
    }

    public void produce(Message message) {
        List<PutMessagesDetailsEntry> messages = new ArrayList<>();
        // Base64 encode
        String base64EncodedMessage = Base64.getEncoder().encodeToString(message.getMessage().getBytes());
        messages.add(PutMessagesDetailsEntry.builder().content(base64EncodedMessage).build());
        PutMessagesDetails putMessagesDetails = PutMessagesDetails.builder().messages(messages).build();
        PutMessagesRequest putMessagesRequest = PutMessagesRequest
                .builder()
                .queueId(queueId)
                .retryConfiguration(RetryConfiguration.SDK_DEFAULT_RETRY_CONFIGURATION)
                .putMessagesDetails(putMessagesDetails)
                .build();
        PutMessagesResponse putMessagesResponse = queueClient
                .putMessages(putMessagesRequest);
        logger.info(String.format("opcRequestId", putMessagesResponse.getOpcRequestId()));
    }

    public List<GetMessage> consume() {
        GetMessagesRequest getMessagesRequest = GetMessagesRequest
                .builder()
                .queueId(queueId)
                .limit(3)
                .retryConfiguration(RetryConfiguration.SDK_DEFAULT_RETRY_CONFIGURATION)
                .build();
        GetMessagesResponse getMessagesResponse = queueClient.getMessages(getMessagesRequest);
        return getMessagesResponse.getGetMessages().getMessages()
                .stream()
                .map(m -> GetMessage
                        .builder()
                        .id(m.getId())
                        .receipt(m.getReceipt())
                        .expireAfter(m.getExpireAfter())
                        .deliveryCount(m.getDeliveryCount())
                        .visibleAfter(m.getVisibleAfter())
                        .content(new String(Base64.getDecoder().decode(m.getContent()))) // Base64 Decoded
                        .build())
                .toList();
    }

}
