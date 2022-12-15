package me.shukawam.oci;

import java.util.List;
import java.util.logging.Logger;

import com.oracle.bmc.queue.model.GetMessage;
import com.oracle.bmc.queue.model.QueueSummary;

import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

@Path("/queue")
@RequestScoped
public class QueueResource {
    private final QueueService queueService;
    private static final Logger logger = Logger.getLogger(QueueResource.class.getName());

    @Inject
    public QueueResource(QueueService queueService) {
        this.queueService = queueService;
    }

    @GET
    @Path("/list")
    @Produces(MediaType.APPLICATION_JSON)
    public List<QueueSummary> listQueues() {
        return queueService.listQueues();
    }

    @POST
    @Path("/produce")
    @Consumes(MediaType.APPLICATION_JSON)
    public String produceMessage(Message message) {
        queueService.produce(message);
        return "OK";
    }

    @GET
    @Path("/consume")
    @Produces(MediaType.APPLICATION_JSON)
    public List<GetMessage> consumeMessage() {
        return queueService.consume();
    }

}
