import {DynamoDBClient} from '@aws-sdk/client-dynamodb'
import {
  DeleteCommand,
  DeleteCommandOutput,
  DynamoDBDocumentClient,
  PutCommand,
  PutCommandOutput,
  ScanCommand,
  ScanCommandInput,
  ScanCommandOutput, UpdateCommand, UpdateCommandInput, UpdateCommandOutput,
} from '@aws-sdk/lib-dynamodb'
import {DynamoDBClientConfig} from "@aws-sdk/client-dynamodb/dist-types/DynamoDBClient"
import {CheckOptionalClientConfig as __CheckOptionalClientConfig} from "@smithy/types/dist-types/client"
import {PutCommandInput} from "@aws-sdk/lib-dynamodb/dist-types/commands/PutCommand";
import {DeleteCommandInput} from "@aws-sdk/lib-dynamodb/dist-types/commands/DeleteCommand";
import EnvironmentHelper from "../utils/environment.helper";

class ClientDatabase {
  public readonly client: DynamoDBClient
  public dDBClient: DynamoDBDocumentClient

  constructor() {
    const endpoint = EnvironmentHelper.getDbEndpoint()
    if (endpoint) {
      this.client = new DynamoDBClient({ endpoint: endpoint } as unknown as __CheckOptionalClientConfig<DynamoDBClientConfig>)
    } else {
      this.client = new DynamoDBClient()
    }
    this.dDBClient = DynamoDBDocumentClient.from(this.client)
  }

  find(parameters: ScanCommandInput): Promise<ScanCommandOutput> {
    return this.dDBClient.send(new ScanCommand(parameters), {})
  }

  insert(parameters: PutCommandInput): Promise<PutCommandOutput> {
    return this.dDBClient.send(new PutCommand(parameters))
  }

  update(parameters: UpdateCommandInput): Promise<UpdateCommandOutput> {
    return this.dDBClient.send(new UpdateCommand(parameters))
  }

  remove(parameters: DeleteCommandInput): Promise<DeleteCommandOutput> {
    return this.dDBClient.send(new DeleteCommand(parameters))
  }
}

const clientDatabase = new ClientDatabase()
export default clientDatabase