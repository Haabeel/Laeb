import { initEdgeStore } from "@edgestore/server";
import { createEdgeStoreNextHandler } from "@edgestore/server/adapters/next/app";
const es = initEdgeStore.create();
const edgeStoreRouter = es.router({
  profilePictures: es.imageBucket({
    maxSize: 1024 * 1024 * 3,
  }),
});
const handler = createEdgeStoreNextHandler({
  router: edgeStoreRouter,
});

export { handler as GET, handler as POST };
export type EdgeStoreRouter = typeof edgeStoreRouter;
