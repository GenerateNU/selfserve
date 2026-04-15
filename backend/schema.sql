


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";





SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."departments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "hotel_id" "text" NOT NULL,
    "name" character varying(255) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."departments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."device_tokens" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "text" NOT NULL,
    "token" "text" NOT NULL,
    "platform" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."device_tokens" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."employee_departments" (
    "employee_id" "text" NOT NULL,
    "department_id" "uuid" NOT NULL
);


ALTER TABLE "public"."employee_departments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."guest_bookings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "guest_id" "uuid" NOT NULL,
    "room_id" "uuid" NOT NULL,
    "arrival_date" "date" NOT NULL,
    "departure_date" "date" NOT NULL,
    "notes" "text",
    "status" character varying(50) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "hotel_id" "text",
    "group_size" integer
);


ALTER TABLE "public"."guest_bookings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."guests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "first_name" "text" NOT NULL,
    "last_name" "text" NOT NULL,
    "profile_picture" "text",
    "timezone" "text" DEFAULT 'UTC'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "phone" "text",
    "email" "text",
    "preferences" "text",
    "notes" "text",
    "pronouns" "text",
    "do_not_disturb_start" time without time zone,
    "do_not_disturb_end" time without time zone,
    "housekeeping_cadence" "text",
    "assistance" "jsonb" DEFAULT '{}'::"jsonb"
);


ALTER TABLE "public"."guests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."hotels" (
    "id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "floors" integer,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."hotels" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "text" NOT NULL,
    "type" "text" NOT NULL,
    "title" "text" NOT NULL,
    "body" "text" NOT NULL,
    "data" "jsonb",
    "read_at" timestamp with time zone,
    "is_archived" boolean DEFAULT false NOT NULL,
    "archived_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."requests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "hotel_id" "text" NOT NULL,
    "guest_id" "uuid",
    "reservation_id" "text",
    "name" "text" NOT NULL,
    "description" "text",
    "room_id" "text",
    "request_category" "text",
    "request_type" "text" NOT NULL,
    "department" "text",
    "status" "text" NOT NULL,
    "priority" "text" NOT NULL,
    "estimated_completion_time" integer,
    "scheduled_time" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "user_id" "text",
    "request_version" timestamp with time zone NOT NULL
);


ALTER TABLE "public"."requests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."rooms" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "room_number" integer NOT NULL,
    "floor" integer NOT NULL,
    "suite_type" character varying(100) NOT NULL,
    "room_status" character varying(100) NOT NULL,
    "features" "text"[] DEFAULT '{}'::"text"[],
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "hotel_id" "text" NOT NULL
);


ALTER TABLE "public"."rooms" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "first_name" "text" NOT NULL,
    "last_name" "text" NOT NULL,
    "employee_id" "text",
    "profile_picture" "text",
    "role" "text",
    "department" "text",
    "timezone" "text" DEFAULT 'UTC'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "id" "text" NOT NULL,
    "hotel_id" "text",
    "phone_number" "text",
    "primary_email" "text"
);


ALTER TABLE "public"."users" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."views" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "filters" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."views" OWNER TO "postgres";


ALTER TABLE ONLY "public"."departments"
    ADD CONSTRAINT "departments_hotel_id_name_unique" UNIQUE ("hotel_id", "name");



ALTER TABLE ONLY "public"."departments"
    ADD CONSTRAINT "departments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."device_tokens"
    ADD CONSTRAINT "device_tokens_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."device_tokens"
    ADD CONSTRAINT "device_tokens_user_id_token_key" UNIQUE ("user_id", "token");



ALTER TABLE ONLY "public"."employee_departments"
    ADD CONSTRAINT "employee_departments_pkey" PRIMARY KEY ("employee_id", "department_id");



ALTER TABLE ONLY "public"."guest_bookings"
    ADD CONSTRAINT "guest_bookings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."guests"
    ADD CONSTRAINT "guests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."hotels"
    ADD CONSTRAINT "hotels_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."requests"
    ADD CONSTRAINT "requests_pkey" PRIMARY KEY ("id", "request_version");



ALTER TABLE ONLY "public"."rooms"
    ADD CONSTRAINT "rooms_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_clerk_id_key" UNIQUE ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_employee_id_key" UNIQUE ("employee_id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."views"
    ADD CONSTRAINT "views_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_departments_hotel_id" ON "public"."departments" USING "btree" ("hotel_id");



CREATE INDEX "idx_employee_departments_department_id" ON "public"."employee_departments" USING "btree" ("department_id");



CREATE INDEX "idx_employee_departments_employee_id" ON "public"."employee_departments" USING "btree" ("employee_id");



CREATE INDEX "idx_floor" ON "public"."rooms" USING "btree" ("floor");



CREATE INDEX "idx_guest_bookings_guest_id" ON "public"."guest_bookings" USING "btree" ("guest_id");



CREATE INDEX "idx_guest_bookings_hotel_id" ON "public"."guest_bookings" USING "btree" ("hotel_id");



CREATE INDEX "idx_guest_bookings_hotel_id_status" ON "public"."guest_bookings" USING "btree" ("hotel_id", "status");



CREATE INDEX "idx_guest_bookings_room_id" ON "public"."guest_bookings" USING "btree" ("room_id");



CREATE INDEX "idx_notifications_user_id_created_at" ON "public"."notifications" USING "btree" ("user_id", "created_at" DESC) WHERE ("is_archived" = false);



CREATE INDEX "idx_users_employee_id" ON "public"."users" USING "btree" ("employee_id");



CREATE INDEX "idx_users_hotel_id" ON "public"."users" USING "btree" ("hotel_id");



CREATE INDEX "idx_views_user_id" ON "public"."views" USING "btree" ("user_id");



ALTER TABLE ONLY "public"."departments"
    ADD CONSTRAINT "departments_hotel_id_fkey" FOREIGN KEY ("hotel_id") REFERENCES "public"."hotels"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."device_tokens"
    ADD CONSTRAINT "device_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."employee_departments"
    ADD CONSTRAINT "employee_departments_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."employee_departments"
    ADD CONSTRAINT "employee_departments_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."guest_bookings"
    ADD CONSTRAINT "guest_bookings_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "public"."guests"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."guest_bookings"
    ADD CONSTRAINT "guest_bookings_hotel_id_fkey" FOREIGN KEY ("hotel_id") REFERENCES "public"."hotels"("id");



ALTER TABLE ONLY "public"."guest_bookings"
    ADD CONSTRAINT "guest_bookings_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."requests"
    ADD CONSTRAINT "requests_hotel_id_fkey" FOREIGN KEY ("hotel_id") REFERENCES "public"."hotels"("id");



ALTER TABLE ONLY "public"."requests"
    ADD CONSTRAINT "requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."rooms"
    ADD CONSTRAINT "rooms_hotel_id_fkey" FOREIGN KEY ("hotel_id") REFERENCES "public"."hotels"("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_hotel_id_fkey" FOREIGN KEY ("hotel_id") REFERENCES "public"."hotels"("id");



ALTER TABLE ONLY "public"."views"
    ADD CONSTRAINT "views_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE "public"."departments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."device_tokens" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."guest_bookings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."guests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."hotels" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."requests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."rooms" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."views" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";














































































































































































GRANT ALL ON TABLE "public"."departments" TO "anon";
GRANT ALL ON TABLE "public"."departments" TO "authenticated";
GRANT ALL ON TABLE "public"."departments" TO "service_role";



GRANT ALL ON TABLE "public"."device_tokens" TO "anon";
GRANT ALL ON TABLE "public"."device_tokens" TO "authenticated";
GRANT ALL ON TABLE "public"."device_tokens" TO "service_role";



GRANT ALL ON TABLE "public"."employee_departments" TO "anon";
GRANT ALL ON TABLE "public"."employee_departments" TO "authenticated";
GRANT ALL ON TABLE "public"."employee_departments" TO "service_role";



GRANT ALL ON TABLE "public"."guest_bookings" TO "anon";
GRANT ALL ON TABLE "public"."guest_bookings" TO "authenticated";
GRANT ALL ON TABLE "public"."guest_bookings" TO "service_role";



GRANT ALL ON TABLE "public"."guests" TO "anon";
GRANT ALL ON TABLE "public"."guests" TO "authenticated";
GRANT ALL ON TABLE "public"."guests" TO "service_role";



GRANT ALL ON TABLE "public"."hotels" TO "anon";
GRANT ALL ON TABLE "public"."hotels" TO "authenticated";
GRANT ALL ON TABLE "public"."hotels" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."requests" TO "anon";
GRANT ALL ON TABLE "public"."requests" TO "authenticated";
GRANT ALL ON TABLE "public"."requests" TO "service_role";



GRANT ALL ON TABLE "public"."rooms" TO "anon";
GRANT ALL ON TABLE "public"."rooms" TO "authenticated";
GRANT ALL ON TABLE "public"."rooms" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



GRANT ALL ON TABLE "public"."views" TO "anon";
GRANT ALL ON TABLE "public"."views" TO "authenticated";
GRANT ALL ON TABLE "public"."views" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































