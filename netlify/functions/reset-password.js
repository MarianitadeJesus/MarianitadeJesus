const { createClient } = require("@supabase/supabase-js");

exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { email, newPassword } = JSON.parse(event.body);

    if (!email || !newPassword) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing email or password" }),
      };
    }

    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    // Get user by email
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      throw new Error("Error listing users: " + listError.message);
    }

    const user = users?.find((u) => u.email === email);

    if (!user) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "User not found" }),
      };
    }

    // Update password
    const { error } = await supabase.auth.admin.updateUserById(user.id, {
      password: newPassword,
    });

    if (error) {
      throw new Error("Error updating password: " + error.message);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: "Password reset successfully" }),
    };
  } catch (error) {
    console.error("Error:", error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || "Internal server error" }),
    };
  }
};

