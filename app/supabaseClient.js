// Lightweight fallback client for environments where Supabase isn't configured yet.
// Keeps UI flows functional and prevents build/runtime crashes.
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
      return result(null);
    },
    single() {
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

export const supabase = {
  from() {
    return makeQuery();
  },
};

