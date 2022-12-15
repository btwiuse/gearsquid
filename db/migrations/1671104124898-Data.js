module.exports = class Data1671104124898 {
    name = 'Data1671104124898'

    async up(db) {
        await db.query(`CREATE TABLE "added_msg" ("id" character varying NOT NULL, "block_number" integer NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "by" text NOT NULL, "msg" text NOT NULL, CONSTRAINT "PK_2751e7899fe0de6cb629e4d0b40" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_c8b195a2301481b9dc338c3b4b" ON "added_msg" ("block_number") `)
        await db.query(`CREATE INDEX "IDX_da57c57f0f9fe70a1e70703d1d" ON "added_msg" ("timestamp") `)
        await db.query(`CREATE INDEX "IDX_b62892614c4d213811a91e9586" ON "added_msg" ("by") `)
    }

    async down(db) {
        await db.query(`DROP TABLE "added_msg"`)
        await db.query(`DROP INDEX "public"."IDX_c8b195a2301481b9dc338c3b4b"`)
        await db.query(`DROP INDEX "public"."IDX_da57c57f0f9fe70a1e70703d1d"`)
        await db.query(`DROP INDEX "public"."IDX_b62892614c4d213811a91e9586"`)
    }
}
