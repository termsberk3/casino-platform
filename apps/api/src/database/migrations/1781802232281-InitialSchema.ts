import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1781802232281 implements MigrationInterface {
    name = 'InitialSchema1781802232281'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "casinos" ("id" BIGSERIAL NOT NULL, "name" character varying(150) NOT NULL, "slug" character varying(150) NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_c4ef2e7c4f2eadd13ca69015fce" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "uq_casinos_slug" ON "casinos"  ("slug") `);
        await queryRunner.query(`CREATE TABLE "game_types" ("id" BIGSERIAL NOT NULL, "name" character varying(100) NOT NULL, "slug" character varying(100) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_5ac179e8c7dc2527ecc0754ccac" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "uq_game_types_slug" ON "game_types"  ("slug") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "uq_game_types_name" ON "game_types"  ("name") `);
        await queryRunner.query(`CREATE TABLE "countries" ("id" BIGSERIAL NOT NULL, "iso_code" character(2) NOT NULL, "name" character varying(100) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "CHK_29d03cdb46deff008008e6fbd7" CHECK ("iso_code" = UPPER("iso_code")), CONSTRAINT "PK_b2d7006793e8697ab3ae2deff18" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "uq_countries_name" ON "countries"  ("name") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "uq_countries_iso_code" ON "countries"  ("iso_code") `);
        await queryRunner.query(`CREATE TABLE "game_countries" ("game_id" bigint NOT NULL, "country_id" bigint NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_b11d74bab1b7ba62e170e4ee0ea" PRIMARY KEY ("game_id", "country_id"))`);
        await queryRunner.query(`CREATE INDEX "idx_game_countries_country_game" ON "game_countries"  ("country_id", "game_id") `);
        await queryRunner.query(`CREATE TYPE "public"."slot_symbol_enum" AS ENUM('cherry', 'lemon', 'apple', 'banana')`);
        await queryRunner.query(`CREATE TABLE "spin_history" ("id" BIGSERIAL NOT NULL, "user_id" bigint NOT NULL, "game_id" bigint, "reel_1" "public"."slot_symbol_enum" NOT NULL, "reel_2" "public"."slot_symbol_enum" NOT NULL, "reel_3" "public"."slot_symbol_enum" NOT NULL, "bet_amount" numeric(12,2) NOT NULL, "gross_winnings" numeric(12,2) NOT NULL DEFAULT '0', "net_result" numeric(12,2) NOT NULL, "payout_multiplier" numeric(8,2) NOT NULL DEFAULT '0', "balance_before" numeric(12,2) NOT NULL, "balance_after" numeric(12,2) NOT NULL, "idempotency_key" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "chk_spin_history_balance_calculation" CHECK ("balance_after" = "balance_before" - "bet_amount" + "gross_winnings"), CONSTRAINT "chk_spin_history_net_result" CHECK ("net_result" = "gross_winnings" - "bet_amount"), CONSTRAINT "chk_spin_history_balance_after" CHECK ("balance_after" >= 0), CONSTRAINT "chk_spin_history_balance_before" CHECK ("balance_before" >= 0), CONSTRAINT "chk_spin_history_payout_multiplier" CHECK ("payout_multiplier" >= 0), CONSTRAINT "chk_spin_history_gross_winnings" CHECK ("gross_winnings" >= 0), CONSTRAINT "chk_spin_history_bet_amount" CHECK ("bet_amount" >= 0.50 AND "bet_amount" <= 5.00 AND MOD("bet_amount", 0.50) = 0), CONSTRAINT "PK_1f6c85b9e501633eed6b6b2e7ee" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_spin_history_game_created_at" ON "spin_history"  ("game_id", "created_at") `);
        await queryRunner.query(`CREATE INDEX "idx_spin_history_user_created_at" ON "spin_history"  ("user_id", "created_at") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "uq_spin_history_user_idempotency" ON "spin_history"  ("user_id", "idempotency_key") `);
        await queryRunner.query(`CREATE TABLE "games" ("id" BIGSERIAL NOT NULL, "external_id" character varying(255), "casino_id" bigint NOT NULL, "game_type_id" bigint NOT NULL, "name" character varying(255) NOT NULL, "slug" character varying(255) NOT NULL, "description" text, "thumbnail_url" text NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "provider_name" character varying(150) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_c9b16b62917b5595af982d66337" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_games_is_active" ON "games"  ("is_active") `);
        await queryRunner.query(`CREATE INDEX "idx_games_game_type_id" ON "games"  ("game_type_id") `);
        await queryRunner.query(`CREATE INDEX "idx_games_casino_id" ON "games"  ("casino_id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "uq_games_casino_slug" ON "games"  ("casino_id", "slug") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "uq_games_external_id" ON "games"  ("external_id") `);
        await queryRunner.query(`CREATE TABLE "user_favorite_games" ("user_id" bigint NOT NULL, "game_id" bigint NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_c59fbbac71409b6a21aa41773fb" PRIMARY KEY ("user_id", "game_id"))`);
        await queryRunner.query(`CREATE INDEX "idx_user_favorite_games_game_user" ON "user_favorite_games"  ("game_id", "user_id") `);
        await queryRunner.query(`CREATE TYPE "public"."users_status_enum" AS ENUM('active', 'disabled')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" BIGSERIAL NOT NULL, "email" character varying(255) NOT NULL, "password_hash" character varying(255) NOT NULL, "display_name" character varying(100), "balance" numeric(12,2) NOT NULL DEFAULT '20', "status" "public"."users_status_enum" NOT NULL DEFAULT 'active', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "CHK_4265f6b8690451d12422766e9a" CHECK ("balance" >= 0), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "refresh_tokens" ("id" BIGSERIAL NOT NULL, "user_id" bigint NOT NULL, "token_hash" character varying(255) NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "revoked_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_refresh_tokens_expires_at" ON "refresh_tokens"  ("expires_at") `);
        await queryRunner.query(`CREATE INDEX "idx_refresh_tokens_user_id" ON "refresh_tokens"  ("user_id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "uq_refresh_tokens_token_hash" ON "refresh_tokens"  ("token_hash") `);
        await queryRunner.query(`ALTER TABLE "game_countries" ADD CONSTRAINT "fk_game_countries_game" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "game_countries" ADD CONSTRAINT "fk_game_countries_country" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "spin_history" ADD CONSTRAINT "fk_spin_history_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "spin_history" ADD CONSTRAINT "fk_spin_history_game" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "games" ADD CONSTRAINT "fk_games_casino" FOREIGN KEY ("casino_id") REFERENCES "casinos"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "games" ADD CONSTRAINT "fk_games_game_type" FOREIGN KEY ("game_type_id") REFERENCES "game_types"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_favorite_games" ADD CONSTRAINT "fk_user_favorite_games_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_favorite_games" ADD CONSTRAINT "fk_user_favorite_games_game" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD CONSTRAINT "fk_refresh_tokens_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP CONSTRAINT "fk_refresh_tokens_user"`);
        await queryRunner.query(`ALTER TABLE "user_favorite_games" DROP CONSTRAINT "fk_user_favorite_games_game"`);
        await queryRunner.query(`ALTER TABLE "user_favorite_games" DROP CONSTRAINT "fk_user_favorite_games_user"`);
        await queryRunner.query(`ALTER TABLE "games" DROP CONSTRAINT "fk_games_game_type"`);
        await queryRunner.query(`ALTER TABLE "games" DROP CONSTRAINT "fk_games_casino"`);
        await queryRunner.query(`ALTER TABLE "spin_history" DROP CONSTRAINT "fk_spin_history_game"`);
        await queryRunner.query(`ALTER TABLE "spin_history" DROP CONSTRAINT "fk_spin_history_user"`);
        await queryRunner.query(`ALTER TABLE "game_countries" DROP CONSTRAINT "fk_game_countries_country"`);
        await queryRunner.query(`ALTER TABLE "game_countries" DROP CONSTRAINT "fk_game_countries_game"`);
        await queryRunner.query(`DROP INDEX "public"."uq_refresh_tokens_token_hash"`);
        await queryRunner.query(`DROP INDEX "public"."idx_refresh_tokens_user_id"`);
        await queryRunner.query(`DROP INDEX "public"."idx_refresh_tokens_expires_at"`);
        await queryRunner.query(`DROP TABLE "refresh_tokens"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."idx_user_favorite_games_game_user"`);
        await queryRunner.query(`DROP TABLE "user_favorite_games"`);
        await queryRunner.query(`DROP INDEX "public"."uq_games_external_id"`);
        await queryRunner.query(`DROP INDEX "public"."uq_games_casino_slug"`);
        await queryRunner.query(`DROP INDEX "public"."idx_games_casino_id"`);
        await queryRunner.query(`DROP INDEX "public"."idx_games_game_type_id"`);
        await queryRunner.query(`DROP INDEX "public"."idx_games_is_active"`);
        await queryRunner.query(`DROP TABLE "games"`);
        await queryRunner.query(`DROP INDEX "public"."uq_spin_history_user_idempotency"`);
        await queryRunner.query(`DROP INDEX "public"."idx_spin_history_user_created_at"`);
        await queryRunner.query(`DROP INDEX "public"."idx_spin_history_game_created_at"`);
        await queryRunner.query(`DROP TABLE "spin_history"`);
        await queryRunner.query(`DROP TYPE "public"."slot_symbol_enum"`);
        await queryRunner.query(`DROP INDEX "public"."idx_game_countries_country_game"`);
        await queryRunner.query(`DROP TABLE "game_countries"`);
        await queryRunner.query(`DROP INDEX "public"."uq_countries_iso_code"`);
        await queryRunner.query(`DROP INDEX "public"."uq_countries_name"`);
        await queryRunner.query(`DROP TABLE "countries"`);
        await queryRunner.query(`DROP INDEX "public"."uq_game_types_name"`);
        await queryRunner.query(`DROP INDEX "public"."uq_game_types_slug"`);
        await queryRunner.query(`DROP TABLE "game_types"`);
        await queryRunner.query(`DROP INDEX "public"."uq_casinos_slug"`);
        await queryRunner.query(`DROP TABLE "casinos"`);
    }

}
