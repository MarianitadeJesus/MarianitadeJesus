import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "npm:@supabase/supabase-js@2";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Initialize Supabase storage on startup
const initStorage = async () => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    
    const bucketName = 'make-9ecaab6b-testimonials';
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      await supabase.storage.createBucket(bucketName, { public: false });
      console.log(`Bucket ${bucketName} created successfully`);
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
};

initStorage();

// Health check endpoint
app.get("/make-server-9ecaab6b/health", (c) => {
  return c.json({ status: "ok" });
});

// ============= AUTH ROUTES =============

// Sign up
app.post("/make-server-9ecaab6b/auth/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    if (!email || !password || !name) {
      return c.json({ error: "Missing required fields" }, 400);
    }
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });
    
    if (error) {
      console.error('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }
    
    return c.json({ success: true, user: data.user });
  } catch (error) {
    console.error('Error in signup:', error);
    return c.json({ error: 'Internal server error during signup' }, 500);
  }
});

// Sign in
app.post("/make-server-9ecaab6b/auth/signin", async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    if (!email || !password) {
      return c.json({ error: "Missing email or password" }, 400);
    }
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
    );
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('Signin error:', error);
      return c.json({ error: error.message }, 400);
    }
    
    // Check if admin
    const isAdmin = email === 'marianitadejesusadmin' || 
                   (data.user?.email === 'marianitadejesusadmin');
    
    return c.json({ 
      success: true, 
      session: data.session,
      user: data.user,
      isAdmin
    });
  } catch (error) {
    console.error('Error in signin:', error);
    return c.json({ error: 'Internal server error during signin' }, 500);
  }
});

// Request password reset OTP
app.post("/make-server-9ecaab6b/auth/request-otp", async (c) => {
  try {
    const { email } = await c.req.json();
    
    if (!email) {
      return c.json({ error: "Email is required" }, 400);
    }
    
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP in KV store with 10 minute expiration
    const otpKey = `otp:${email}`;
    await kv.set(otpKey, otp);
    
    // In production, send OTP via email. For demo, return it.
    console.log(`OTP for ${email}: ${otp}`);
    
    return c.json({ 
      success: true, 
      message: "OTP generated",
      // For demo purposes, include OTP in response
      otp 
    });
  } catch (error) {
    console.error('Error requesting OTP:', error);
    return c.json({ error: 'Internal server error requesting OTP' }, 500);
  }
});

// Verify OTP
app.post("/make-server-9ecaab6b/auth/verify-otp", async (c) => {
  try {
    const { email, otp } = await c.req.json();
    
    if (!email || !otp) {
      return c.json({ error: "Email and OTP are required" }, 400);
    }
    
    const otpKey = `otp:${email}`;
    const storedOtp = await kv.get(otpKey);
    
    if (!storedOtp || storedOtp !== otp) {
      return c.json({ error: "Invalid or expired OTP" }, 400);
    }
    
    // OTP is valid, delete it and create a reset token
    await kv.del(otpKey);
    
    const resetToken = crypto.randomUUID();
    const resetKey = `reset:${email}`;
    await kv.set(resetKey, resetToken);
    
    return c.json({ 
      success: true, 
      resetToken 
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return c.json({ error: 'Internal server error verifying OTP' }, 500);
  }
});

// Reset password
app.post("/make-server-9ecaab6b/auth/reset-password", async (c) => {
  try {
    const { email, resetToken, newPassword } = await c.req.json();
    
    if (!email || !resetToken || !newPassword) {
      return c.json({ error: "Missing required fields" }, 400);
    }
    
    const resetKey = `reset:${email}`;
    const storedToken = await kv.get(resetKey);
    
    if (!storedToken || storedToken !== resetToken) {
      return c.json({ error: "Invalid or expired reset token" }, 400);
    }
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    
    // Get user by email
    const { data: users } = await supabase.auth.admin.listUsers();
    const user = users.users.find(u => u.email === email);
    
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }
    
    // Update password
    const { error } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    );
    
    if (error) {
      console.error('Password reset error:', error);
      return c.json({ error: error.message }, 400);
    }
    
    // Delete reset token
    await kv.del(resetKey);
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error resetting password:', error);
    return c.json({ error: 'Internal server error resetting password' }, 500);
  }
});

// ============= RESERVATIONS ROUTES =============

// Create reservation
app.post("/make-server-9ecaab6b/reservations", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const reservation = await c.req.json();
    const reservationId = crypto.randomUUID();
    
    const reservationData = {
      ...reservation,
      id: reservationId,
      userId: user.id,
      userEmail: user.email,
      status: 'pendiente',
      createdAt: new Date().toISOString(),
      paymentLink: `https://payments.example.com/pay/${reservationId}` // Demo payment link
    };
    
    await kv.set(`reservation:${reservationId}`, JSON.stringify(reservationData));
    
    // Add to user's reservations list
    const userReservationsKey = `user-reservations:${user.id}`;
    const existingReservations = await kv.get(userReservationsKey);
    const reservationIds = existingReservations ? JSON.parse(existingReservations) : [];
    reservationIds.push(reservationId);
    await kv.set(userReservationsKey, JSON.stringify(reservationIds));
    
    console.log(`Reservation created: ${reservationId} for user ${user.email}`);
    
    return c.json({ 
      success: true, 
      reservation: reservationData 
    });
  } catch (error) {
    console.error('Error creating reservation:', error);
    return c.json({ error: 'Internal server error creating reservation' }, 500);
  }
});

// Get all reservations (admin only)
app.get("/make-server-9ecaab6b/reservations", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    if (!user || user.email !== 'marianitadejesusadmin') {
      return c.json({ error: 'Unauthorized - Admin access required' }, 403);
    }
    
    const reservations = await kv.getByPrefix('reservation:');
    const parsedReservations = reservations.map(r => JSON.parse(r));
    
    return c.json({ reservations: parsedReservations });
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return c.json({ error: 'Internal server error fetching reservations' }, 500);
  }
});

// Get user's reservations
app.get("/make-server-9ecaab6b/reservations/my", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const userReservationsKey = `user-reservations:${user.id}`;
    const reservationIdsStr = await kv.get(userReservationsKey);
    
    if (!reservationIdsStr) {
      return c.json({ reservations: [] });
    }
    
    const reservationIds = JSON.parse(reservationIdsStr);
    const reservationKeys = reservationIds.map((id: string) => `reservation:${id}`);
    const reservations = await kv.mget(reservationKeys);
    const parsedReservations = reservations.filter(r => r).map(r => JSON.parse(r));
    
    return c.json({ reservations: parsedReservations });
  } catch (error) {
    console.error('Error fetching user reservations:', error);
    return c.json({ error: 'Internal server error fetching reservations' }, 500);
  }
});

// Update reservation (admin only)
app.put("/make-server-9ecaab6b/reservations/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    if (!user || user.email !== 'marianitadejesusadmin') {
      return c.json({ error: 'Unauthorized - Admin access required' }, 403);
    }
    
    const id = c.req.param('id');
    const updates = await c.req.json();
    
    const key = `reservation:${id}`;
    const existing = await kv.get(key);
    
    if (!existing) {
      return c.json({ error: 'Reservation not found' }, 404);
    }
    
    const reservationData = JSON.parse(existing);
    const updatedReservation = { ...reservationData, ...updates };
    
    await kv.set(key, JSON.stringify(updatedReservation));
    
    console.log(`Reservation updated: ${id}`);
    
    return c.json({ success: true, reservation: updatedReservation });
  } catch (error) {
    console.error('Error updating reservation:', error);
    return c.json({ error: 'Internal server error updating reservation' }, 500);
  }
});

// Delete reservation (admin only)
app.delete("/make-server-9ecaab6b/reservations/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    if (!user || user.email !== 'marianitadejesusadmin') {
      return c.json({ error: 'Unauthorized - Admin access required' }, 403);
    }
    
    const id = c.req.param('id');
    const key = `reservation:${id}`;
    
    const existing = await kv.get(key);
    if (!existing) {
      return c.json({ error: 'Reservation not found' }, 404);
    }
    
    const reservation = JSON.parse(existing);
    
    // Remove from user's reservations list
    const userReservationsKey = `user-reservations:${reservation.userId}`;
    const reservationIdsStr = await kv.get(userReservationsKey);
    if (reservationIdsStr) {
      const reservationIds = JSON.parse(reservationIdsStr);
      const filtered = reservationIds.filter((rid: string) => rid !== id);
      await kv.set(userReservationsKey, JSON.stringify(filtered));
    }
    
    await kv.del(key);
    
    console.log(`Reservation deleted: ${id}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting reservation:', error);
    return c.json({ error: 'Internal server error deleting reservation' }, 500);
  }
});

// ============= TESTIMONIALS ROUTES =============

// Create testimonial
app.post("/make-server-9ecaab6b/testimonials", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const testimonial = await c.req.json();
    const testimonialId = crypto.randomUUID();
    
    const testimonialData = {
      ...testimonial,
      id: testimonialId,
      userId: user.id,
      userName: user.user_metadata?.name || user.email,
      userEmail: user.email,
      createdAt: new Date().toISOString(),
      hidden: false
    };
    
    await kv.set(`testimonial:${testimonialId}`, JSON.stringify(testimonialData));
    
    console.log(`Testimonial created: ${testimonialId} by ${user.email}`);
    
    return c.json({ 
      success: true, 
      testimonial: testimonialData 
    });
  } catch (error) {
    console.error('Error creating testimonial:', error);
    return c.json({ error: 'Internal server error creating testimonial' }, 500);
  }
});

// Get all testimonials (visible ones for public, all for admin)
app.get("/make-server-9ecaab6b/testimonials", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    let isAdmin = false;
    
    if (accessToken) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      );
      
      const { data: { user } } = await supabase.auth.getUser(accessToken);
      isAdmin = user?.email === 'marianitadejesusadmin';
    }
    
    const testimonials = await kv.getByPrefix('testimonial:');
    const parsedTestimonials = testimonials.map(t => JSON.parse(t));
    
    // Filter hidden testimonials for non-admin users
    const filtered = isAdmin ? parsedTestimonials : parsedTestimonials.filter(t => !t.hidden);
    
    // Sort by most recent
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return c.json({ testimonials: filtered });
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return c.json({ error: 'Internal server error fetching testimonials' }, 500);
  }
});

// Update testimonial (admin only)
app.put("/make-server-9ecaab6b/testimonials/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    if (!user || user.email !== 'marianitadejesusadmin') {
      return c.json({ error: 'Unauthorized - Admin access required' }, 403);
    }
    
    const id = c.req.param('id');
    const updates = await c.req.json();
    
    const key = `testimonial:${id}`;
    const existing = await kv.get(key);
    
    if (!existing) {
      return c.json({ error: 'Testimonial not found' }, 404);
    }
    
    const testimonialData = JSON.parse(existing);
    const updatedTestimonial = { ...testimonialData, ...updates };
    
    await kv.set(key, JSON.stringify(updatedTestimonial));
    
    console.log(`Testimonial updated: ${id}`);
    
    return c.json({ success: true, testimonial: updatedTestimonial });
  } catch (error) {
    console.error('Error updating testimonial:', error);
    return c.json({ error: 'Internal server error updating testimonial' }, 500);
  }
});

// Delete testimonial (admin only)
app.delete("/make-server-9ecaab6b/testimonials/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    if (!user || user.email !== 'marianitadejesusadmin') {
      return c.json({ error: 'Unauthorized - Admin access required' }, 403);
    }
    
    const id = c.req.param('id');
    await kv.del(`testimonial:${id}`);
    
    console.log(`Testimonial deleted: ${id}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    return c.json({ error: 'Internal server error deleting testimonial' }, 500);
  }
});

// Upload image for testimonial
app.post("/make-server-9ecaab6b/upload", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;
    
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    const { error: uploadError } = await supabase.storage
      .from('make-9ecaab6b-testimonials')
      .upload(filePath, uint8Array, {
        contentType: file.type,
      });
    
    if (uploadError) {
      console.error('Upload error:', uploadError);
      return c.json({ error: uploadError.message }, 400);
    }
    
    const { data: signedUrl } = await supabase.storage
      .from('make-9ecaab6b-testimonials')
      .createSignedUrl(filePath, 60 * 60 * 24 * 365); // 1 year
    
    return c.json({ 
      success: true, 
      url: signedUrl?.signedUrl,
      path: filePath
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return c.json({ error: 'Internal server error uploading file' }, 500);
  }
});

Deno.serve(app.fetch);
