import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function result(data = null, error = null) {
  return Promise.resolve({ data, error });
}

function makeQuery() {
  return {
    select() {
      return this;
    },
    order() {
      return result([]);
    },
    eq() {
      return this;
    },
    in() {
      return this;
    },
    single() {
      return result(null);
    },
    maybeSingle() {
      return result(null);
    },
    insert() {
      return {
        select() {
          return {
            single() {
              return result(null);
            },
          };
        },
      };
    },
    upsert() {
      return result(null);
    },
    update() {
      return {
        eq() {
          return result(null);
        },
      };
    },
    delete() {
      return {
        eq() {
          return result(null);
        },
      };
    },
  };
}

function makeFallbackChannel() {
  return {
    on() {
      return this;
    },
    subscribe(callback) {
      if (typeof callback === "function") callback("CLOSED");
      return this;
    },
  };
}

function makeFallbackClient() {
  return {
    from() {
      return makeQuery();
    },
    rpc() {
      return result(null);
    },
    channel() {
      return makeFallbackChannel();
    },
    removeChannel() {},
  };
}

export const supabase =
  url && anon
    ? createClient(url, anon, {
        auth: { persistSession: false },
      })
    : makeFallbackClient();
