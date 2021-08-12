package com.example.fn;


import com.oracle.bmc.auth.ResourcePrincipalAuthenticationDetailsProvider;
import com.oracle.bmc.core.ComputeClient;
import com.oracle.bmc.core.model.UpdateInstanceDetails;
import com.oracle.bmc.core.requests.GetInstanceRequest;
import com.oracle.bmc.core.requests.UpdateInstanceRequest;

public class HelloFunction {
    private ComputeClient computeClient = null;
    final ResourcePrincipalAuthenticationDetailsProvider provider = ResourcePrincipalAuthenticationDetailsProvider
            .builder()
            .build();

    public HelloFunction() {
        try {
            computeClient = new ComputeClient(provider);
        } catch (Throwable e) {
            e.printStackTrace();
        }
    }

    public String handleRequest(String instanceOcid, String alarmMessageShape) {
        GetInstanceRequest getInstanceRequest = GetInstanceRequest.builder().instanceId(instanceOcid).build();
        String currentShape = computeClient.getInstance(getInstanceRequest).getInstance().getShape();
        String newShape;
        if ("VM.Standard1.1".equals(currentShape)) {
            newShape = "VM.Standard2.1";
        } else if ("VM.Standard2.1".equals(currentShape)) {
            newShape = "VM.Standard2.2";
        } else {
            return String.format("Indtance %s cannot get a bigger shape than its current shape %s",
                    instanceOcid,
                    alarmMessageShape);
        }
        try {
            UpdateInstanceDetails details = UpdateInstanceDetails.builder().shape(newShape).build();
            UpdateInstanceRequest updateInstanceRequest = UpdateInstanceRequest.builder()
                    .instanceId(instanceOcid)
                    .updateInstanceDetails(details)
                    .build();
            computeClient.updateInstance(updateInstanceRequest);
        } catch (Throwable ex) {
            ex.printStackTrace();
        }
        return String.format("The shape of Instance %s is updated, the instance is rebooting...", instanceOcid);
    }

}