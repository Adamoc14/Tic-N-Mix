// Imports and Package Declarations
import nats, { Stan } from 'node-nats-streaming'

// Class Declaration
class NatsWrapper {

    // Property Declarations
    private _client? : Stan

    // Getters and Setters
    get client(){
        if(!this._client) throw new Error('Can\'t access NATS client before connecting!')
        return this._client
    }

    connect(clusterId : string, clientId: string, url: string) {
        this._client = nats.connect(clusterId, clientId, { url });

        return new Promise<void>((resolve, reject) => {
            this.client.on('connect', () => {
                resolve()
            })
            this.client.on('error', err => {
                console.log(`Error connecting to Nats: ${err}`)
                reject(err)
            })
        })
    }


}

// Export
export const natsWrapper = new NatsWrapper()