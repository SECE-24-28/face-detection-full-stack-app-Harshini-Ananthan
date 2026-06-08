import { ApolloServer } from "@apollo/server";
import { typeDefs } from "../../../graphql/typeDefs";
import { resolvers } from "../../../graphql/resolvers";

const server = new ApolloServer({ typeDefs, resolvers });
let serverStarted = false;
async function ensureStarted() {
  if (!serverStarted) {
    await server.start();
    serverStarted = true;
  }
}

export const runtime = "nodejs";

export async function POST(request: Request) {
  const rawBody = await request.text();
  let parsedBody: any = rawBody;
  try {
    parsedBody = JSON.parse(rawBody);
  } catch (e) {
    parsedBody = rawBody;
  }

  const httpGraphQLRequest = {
    body: parsedBody,
    headers: request.headers as any,
    method: request.method,
    search: new URL(request.url).search,
  };

  await ensureStarted();
  const response = await server.executeHTTPGraphQLRequest({
    httpGraphQLRequest,
    context: async () => ({}),
  });

  if (response.body.kind === "complete") {
    const bodyText = response.body.string;
    return new Response(bodyText, {
      status: response.status || 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  if (response.body.kind === "chunked") {
    const chunks: string[] = [];
    for await (const chunk of response.body.asyncIterator) {
      chunks.push(typeof chunk === "string" ? chunk : new TextDecoder().decode(chunk));
    }
    return new Response(chunks.join(""), {
      status: response.status || 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  return new Response("", { status: response.status || 200 });
}

export async function GET() {
  return new Response("GraphQL endpoint");
}
