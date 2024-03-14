import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1710374012377 implements MigrationInterface {
  name = "Init1710374012377";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "party" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_e6189b3d533e140bb33a6d2cec1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "range" ("id" SERIAL NOT NULL, "characterId" integer NOT NULL, "timerange" tsrange NOT NULL, "location" character varying NOT NULL, "timezone" character varying NOT NULL, "order" integer NOT NULL, CONSTRAINT "UQ_6170d6e2c9aef8edbc79bd97754" UNIQUE ("characterId", "order"), CONSTRAINT "PK_a0a1eb8dc140c99b397c8b1dbc1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "character" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "age" interval NOT NULL, "remainingSpan" interval NOT NULL, "spannerLevel" integer NOT NULL DEFAULT '0', "nextSpanOrder" integer NOT NULL DEFAULT '0', "nextRangeOrder" integer NOT NULL DEFAULT '0', "partyId" integer NOT NULL, CONSTRAINT "PK_6c4aec48c564968be15078b8ae5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "event" ("id" SERIAL NOT NULL, "characterId" integer NOT NULL, "rangeId" integer NOT NULL, "time" TIMESTAMP NOT NULL, "toTime" TIMESTAMP, "fromTime" TIMESTAMP, "charAge" interval NOT NULL, "charRemainingSpan" interval NOT NULL, "charSpannerLevel" integer NOT NULL, "timezone" character varying NOT NULL, "toTimezone" character varying, "fromTimezone" character varying, "order" integer NOT NULL, "location" character varying NOT NULL, "toLocation" character varying, "fromLocation" character varying, "notes" character varying, "type" "public"."event_type_enum" NOT NULL, CONSTRAINT "UQ_7f527242acb7b31346f1fadcc5f" UNIQUE ("characterId", "order"), CONSTRAINT "PK_30c2f3bbaf6d34a55f8ae6e4614" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "range" ADD CONSTRAINT "FK_b11cfca7dae69fedbfba7f5fa8d" FOREIGN KEY ("characterId") REFERENCES "character"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "character" ADD CONSTRAINT "FK_72a4a9f63033ddc97b46e8c1711" FOREIGN KEY ("partyId") REFERENCES "party"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "event" ADD CONSTRAINT "FK_2108b6a29c3a823216780d2fc0c" FOREIGN KEY ("characterId") REFERENCES "character"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "event" ADD CONSTRAINT "FK_ab66785e5f252627976b3761e05" FOREIGN KEY ("rangeId") REFERENCES "range"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    // custom index for tsrange
    await queryRunner.query(
      `create index tsrange_idx on range using gist (timerange)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "event" DROP CONSTRAINT "FK_ab66785e5f252627976b3761e05"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event" DROP CONSTRAINT "FK_2108b6a29c3a823216780d2fc0c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "character" DROP CONSTRAINT "FK_72a4a9f63033ddc97b46e8c1711"`,
    );
    await queryRunner.query(
      `ALTER TABLE "range" DROP CONSTRAINT "FK_b11cfca7dae69fedbfba7f5fa8d"`,
    );
    await queryRunner.query(`DROP TABLE "event"`);
    await queryRunner.query(`DROP TABLE "character"`);
    await queryRunner.query(`DROP TABLE "range"`);
    await queryRunner.query(`DROP TABLE "party"`);
  }
}
