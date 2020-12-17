const st = require('oci-streaming');
const common = require('oci-common');

const compartmentId = process.env.COMPARTMENT_ID;
const exampleStreamName = 'demo-streaming';
const partitions = 1;

let provider;
let adminClient;
let client;

(async () => {
    // Use Instacne Principals
    provider = await new common.InstancePrincipalsAuthenticationDetailsProviderBuilder().build();
    adminClient = new st.StreamAdminClient({ authenticationDetailsProvider: provider });
    client = new st.StreamClient({ authenticationDetailsProvider: provider });
    const waiters = adminClient.createWaiters();
    console.log('Get or Create the stream.');
    let stream = await getOrCreateStream(compartmentId, partitions, exampleStreamName);
    // Streams are assigned a specific endpoint url based on where they are provisioned.
    // Create a stream client using the provided message endpoint.
    client.endpoint = stream.messagesEndpoint;
    const streamId = stream.id;

    // publish some messages to the stream
    await publishExampleMessages(client, streamId);

    // give the streaming service a second to propagate messages
    await delay(1);

    // Use a cursor for getting messages; each getMessages call will return a next-cursor for iteration.
    // There are a couple kinds of cursors.
    // A cursor can be created at a given partition/offset.
    // This gives explicit offset management control to the consumer.

    console.log('Starting a simple message loop with a partition cursor');
    const partitionCursor = await getCursorByPartition(client, streamId, '0');
    await simpleMessageLoop(client, streamId, partitionCursor);

    // A cursor can be created as part of a consumer group.
    // Committed offsets are managed for the group, and partitions
    // are dynamically balanced amongst consumers in the group.

    console.log('Starting a simple message loop with a group cursor');
    const groupCursor = await getCursorByGroup(client, streamId, 'exampleGroup', 'exampleInstance-1');
    await simpleMessageLoop(client, streamId, groupCursor);

    // Cleanup; remember to delete streams which are not in use.
    await deleteStream(adminClient, streamId);

    // Stream deletion is an asynchronous operation, give it some time to complete.
    const getStreamRequest = { streamId: streamId };
    await waiters.forStream(getStreamRequest, st.models.Stream.LifecycleState.Deleted);
})();

async function getOrCreateStream(compartmentId, paritions, exampleStreamName) {
    console.log('Enter getOrCreateStream');
    const listStreamsRequest = {
        compartmentId: compartmentId,
        name: exampleStreamName,
        lifecycleState: st.models.Stream.LifecycleState.Active.toString()
    };
    console.log(listStreamsRequest);
    const listStreamsResponse = await adminClient.listStreams(listStreamsRequest);

    if (listStreamsResponse.items.length !== 0) {
        console.log('An active stream with name %s was found.', exampleStreamName);
        const getStreamRequest = {
            streamId: listStreamsResponse.items[0].id
        };
        const getStreamResponse = await adminClient.getStream(getStreamRequest);
        return getStreamResponse.stream;
    }
    console.log('No active stream named %s was found.', exampleStreamName);
    console.log('Creatong stream with paritions' + partitions);
    const createStreamDetails = {
        name: exampleStreamName,
        compartmentId: compartmentId,
        partitions: partitions
    };
    const creatStreamRequest = {
        createStreamDetails: createStreamDetails
    };
    const createStreamResponse = await adminClient.createStream(creatStreamRequest);
    // GetStream provides details about a specific stream.
    // Since stream creation is asynchronous; we need to wait for the stream to become active.
    const getStreamRequest = {
        streamId: createStreamResponse.stream.id
    };
    const activeStream = await waiters.forStream(
        getStreamRequest,
        st.models.Stream.LifecycleState.Active
    );
    console.log('Create Stream executed successfully.');
    // Give a little time for the stream to be ready.
    await delay(1);
    return activeStream.stream;
}

async function publishExampleMessages(client, streamId) {
    // build up a putRequest and publish some messages to the stream
    let messages = [];
    for (let i = 1; i <= 3; i++) {
        let entry = {
            key: Buffer.from('messageKey' + i).toString('base64'),
            value: Buffer.from('messageValue' + i).toString('base64')
        };
        messages.push(entry);
    }

    console.log('Publishing %s messages to stream %s.', messages.length, streamId);
    const putMessageDetails = { messages: messages };
    const putMessagesRequest = {
        putMessagesDetails: putMessageDetails,
        streamId: streamId
    };
    const putMessageResponse = await client.putMessages(putMessagesRequest);
    for (var entry of putMessageResponse.putMessagesResult.entries)
        console.log('Published messages to parition %s, offset %s', entry.partition, entry.offset);
}

async function getCursorByPartition(client, streamId, partition) {
    console.log('Creating a cursor for partition %s.', partition);
    let cursorDetails = {
        partition: partition,
        type: st.models.CreateCursorDetails.Type.TrimHorizon
    };
    const createCursorRequest = {
        streamId: streamId,
        createCursorDetails: cursorDetails
    };
    const createCursorResponse = await client.createCursor(createCursorRequest);
    return createCursorResponse.cursor.value;
}

async function simpleMessageLoop(client, streamId, initialCursor) {
    let cursor = initialCursor;
    for (var i = 0; i < 10; i++) {
        const getRequest = {
            streamId: streamId,
            cursor: cursor,
            limit: 10
        };
        const response = await client.getMessages(getRequest);
        console.log('Read %s messages.', response.items.length);
        for (var message of response.items) {
            console.log(
                '%s: %s',
                Buffer.from(message.key, 'base64').toString(),
                Buffer.from(message.value, 'base64').toString()
            );
        }
        // getMessages is a throttled method; clients should retrieve sufficiently large message
        // batches, as to avoid too many http requests.
        await delay(2);
        cursor = response.opcNextCursor;
    }
}

async function getCursorByGroup(client, streamId, groupName, instanceName) {
    console.log('Creating a cursor for group %s, instance %s.', groupName, instanceName);
    const cursorDetails = {
        groupName: groupName,
        instanceName: instanceName,
        type: st.models.CreateGroupCursorDetails.Type.TrimHorizon,
        commitOnGet: true
    };
    const createCursorRequest = {
        createGroupCursorDetails: cursorDetails,
        streamId: streamId
    };
    const response = await client.createGroupCursor(createCursorRequest);
    return response.cursor.value;
}

async function deleteStream(client, streamId) {
    const request = { streamId: streamId };
    await client.deleteStream(request);
}

async function delay(s) {
    return new Promise(resolve => setTimeout(resolve, s * 1000));
}