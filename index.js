const { ApolloServer } = require('apollo-server');
const { ApolloGateway } = require('@apollo/gateway');
const { readFile } = require('fs/promises');  
const { watch } = require('fs');

const gateway = new ApolloGateway({
  async supergraphSdl({ update, healthCheck }) {
    
    const watcher = watch('./supergraph.graphql');
    watcher.on('change', async () => {
        try {
            const updatedSuperGraph = await readFile('./supergraph.graphql', 'utf-8');
            await healthCheck(updatedSuperGraph)
            update(updatedSuperGraph)
        } catch(e) {
            console.error(e)
        }
    });
      return {
        supergraphSdl: await readFile('./supergraph.graphql', 'utf-8'),
        async cleanup() {
            watcher.close()
        }
      }
  },
});

const server = new ApolloServer({
  gateway,
});

server.listen().then(({ url }) => {
  console.log(`🚀 Gateway ready at ${url}`);
}).catch(err => {console.error(err)});

