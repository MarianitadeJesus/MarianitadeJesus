import React, { useState } from 'react';
import {
  Sparkles,
  Users,
  Utensils,
  Music,
  Camera,
  TreePine,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Facebook,
  Instagram,
  Send,
  Star,
  Upload,
  Calendar,
  Clock,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Navigation,
  Download
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { supabase } from '../utils/supabase/client';

interface SectionsProps {
  user: any;
  accessToken: string;
  onLoginClick: () => void;
}

export function Sections({ user, accessToken, onLoginClick }: SectionsProps) {
  // Reservations state
  const [reservationForm, setReservationForm] = useState({
    name: user?.user_metadata?.name || '',
    email: user?.email || '',
    phone: '',
    date: '',
    time: '',
    guests: '',
    message: '',
  });
  const [submittingReservation, setSubmittingReservation] = useState(false);

  // Testimonials state
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [testimonialForm, setTestimonialForm] = useState({
    text: '',
    rating: 5,
    image_url: '',
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submittingTestimonial, setSubmittingTestimonial] = useState(false);

  // Gallery state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Gallery images from local public folder
  const galleryImages = [
    '/gallery-1.jpg',
    '/gallery-2.jpg',
    '/gallery-3.jpg',
    '/gallery-4.jpg',
    '/gallery-5.jpg',
  ];

  // Load testimonials on mount
  React.useEffect(() => {
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('hidden', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTestimonials(data || []);
    } catch (error: any) {
      console.error('Error loading testimonials:', error);
    }
  };

  const handleReservationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Debes iniciar sesión para hacer una reservación');
      onLoginClick();
      return;
    }

    if (!reservationForm.name || !reservationForm.email || !reservationForm.phone || 
        !reservationForm.date || !reservationForm.time || !reservationForm.guests) {
      toast.error('Por favor, completa todos los campos obligatorios');
      return;
    }

    setSubmittingReservation(true);
    try {
      const { data, error } = await supabase
        .from('reservations')
        .insert({
          ...reservationForm,
          user_id: user.id,
          status: 'pendiente',
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('¡Reservación creada! Recibirás un enlace de pago por correo.');
      toast.info(`Enlace de pago (demo): https://payment-link.com/${data.id}`);
      
      setReservationForm({
        name: user?.user_metadata?.name || '',
        email: user?.email || '',
        phone: '',
        date: '',
        time: '',
        guests: '',
        message: '',
      });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmittingReservation(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar formato de archivo
    const allowedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedFormats.includes(file.type)) {
      toast.error('Formato no permitido. Solo imágenes: JPG, PNG, GIF, WebP');
      return;
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('Imagen demasiado grande. Máximo 5MB');
      return;
    }

    if (!user) {
      toast.error('Debes iniciar sesión para subir imágenes');
      return;
    }

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const filePath = `testimonials/${fileName}`;

      const { data, error } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      setTestimonialForm({ ...testimonialForm, image_url: publicUrl });
      toast.success('Imagen subida correctamente');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleTestimonialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Debes iniciar sesión para dejar un testimonio');
      onLoginClick();
      return;
    }

    if (!testimonialForm.text) {
      toast.error('Por favor, escribe tu experiencia');
      return;
    }

    setSubmittingTestimonial(true);
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .insert({
          ...testimonialForm,
          user_id: user.id,
          user_name: user.user_metadata?.name || user.email,
          hidden: false,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('¡Gracias por compartir tu experiencia!');
      setTestimonialForm({ text: '', rating: 5, image_url: '' });
      loadTestimonials();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmittingTestimonial(false);
    }
  };

  const whatsappMessage = encodeURIComponent('Hola 😊👋, qué tal, quisiera saber más información sobre la quinta y me encantaría hacer una reservación');

  return (
    <>
      {/* Hero Section */}
      <section id="hero" className="min-h-screen flex items-center justify-center px-4 pt-20 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Christmas lights decoration */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 via-red-500 to-green-500 opacity-30" />
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="max-w-4xl mx-auto text-center relative z-10"
        >
          <div className="inline-block px-6 py-3 mb-6 rounded-full backdrop-blur-md bg-white/60 border border-white/40 shadow-lg">
            <p className="text-green-700 flex items-center gap-2 justify-center">
              <Sparkles className="w-5 h-5" />
              Tu escape privado en la naturaleza
            </p>
          </div>

          <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl text-green-900 mb-6">
            Quinta Privada<br />
            <span className="text-green-700">Marianita de Jesús</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Un oasis de tranquilidad y elegancia donde tus momentos especiales se convierten en recuerdos inolvidables
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => document.getElementById('reservations')?.scrollIntoView({ behavior: 'smooth' })}
              size="lg"
              className="bg-gradient-to-r from-green-600 to-green-700 text-white shadow-xl hover:shadow-2xl transition-all"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Reservar Ahora
            </Button>
            <Button
              onClick={() => document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' })}
              size="lg"
              variant="outline"
              className="backdrop-blur-md bg-white/60 border-white/40 hover:bg-white/80"
            >
              <Camera className="w-5 h-5 mr-2" />
              Ver Galería
            </Button>
          </div>
        </motion.div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="backdrop-blur-xl bg-white/70 rounded-3xl p-8 sm:p-12 border border-white/40 shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center">
                <TreePine className="w-6 h-6 text-white" />
              </div>
              <h2 className="font-serif text-4xl text-green-900">Quiénes Somos</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  Quinta Privada Marianita de Jesús es un refugio exclusivo diseñado para quienes buscan 
                  experiencias únicas en un entorno natural privilegiado. Combinamos la elegancia de nuestras 
                  instalaciones con la calidez de un servicio personalizado.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Cada rincón de nuestra quinta ha sido cuidadosamente diseñado para ofrecerte privacidad, 
                  confort y una conexión genuina con la naturaleza. Ideal para celebraciones, retiros 
                  familiares o simplemente para desconectar del ajetreo diario.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="backdrop-blur-md bg-green-50/80 p-6 rounded-2xl border border-green-100">
                  <Users className="w-8 h-8 text-green-700 mb-3" />
                  <h3 className="text-green-900 mb-2">Privacidad</h3>
                  <p className="text-sm text-gray-600">Espacio exclusivo para ti y los tuyos</p>
                </div>
                <div className="backdrop-blur-md bg-green-50/80 p-6 rounded-2xl border border-green-100">
                  <TreePine className="w-8 h-8 text-green-700 mb-3" />
                  <h3 className="text-green-900 mb-2">Naturaleza</h3>
                  <p className="text-sm text-gray-600">Rodeado de vegetación exuberante</p>
                </div>
                <div className="backdrop-blur-md bg-green-50/80 p-6 rounded-2xl border border-green-100">
                  <Sparkles className="w-8 h-8 text-green-700 mb-3" />
                  <h3 className="text-green-900 mb-2">Elegancia</h3>
                  <p className="text-sm text-gray-600">Diseño premium y refinado</p>
                </div>
                <div className="backdrop-blur-md bg-green-50/80 p-6 rounded-2xl border border-green-100">
                  <Music className="w-8 h-8 text-green-700 mb-3" />
                  <h3 className="text-green-900 mb-2">Eventos</h3>
                  <p className="text-sm text-gray-600">Perfecta para toda ocasión</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl sm:text-5xl text-green-900 mb-4">Nuestros Servicios</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Ofrecemos una experiencia completa con todo lo que necesitas para tu evento especial
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Users className="w-8 h-8" />,
                title: 'Eventos Privados',
                description: 'Celebraciones familiares, cumpleaños, aniversarios y reuniones exclusivas',
                color: 'from-green-500 to-green-600'
              },
              {
                icon: <Utensils className="w-8 h-8" />,
                title: 'Catering Gourmet',
                description: 'Servicio de alimentación personalizado con menús a tu medida',
                color: 'from-emerald-500 to-emerald-600'
              },
              {
                icon: <Music className="w-8 h-8" />,
                title: 'Música & Entretenimiento',
                description: 'Sistema de audio profesional y opciones de entretenimiento',
                color: 'from-teal-500 to-teal-600'
              },
              {
                icon: <Camera className="w-8 h-8" />,
                title: 'Espacios Fotogénicos',
                description: 'Rincones únicos perfectos para tus fotografías y videos',
                color: 'from-lime-500 to-lime-600'
              },
              {
                icon: <TreePine className="w-8 h-8" />,
                title: 'Jardines Naturales',
                description: 'Amplias áreas verdes con vegetación cuidada y senderos',
                color: 'from-green-600 to-green-700'
              },
              {
                icon: <Sparkles className="w-8 h-8" />,
                title: 'Piscina & Áreas de Recreo',
                description: 'Zonas de esparcimiento para todas las edades',
                color: 'from-cyan-500 to-cyan-600'
              },
            ].map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="backdrop-blur-xl bg-white/70 rounded-2xl p-6 border border-white/40 shadow-lg hover:shadow-2xl transition-all cursor-pointer"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center text-white mb-4 shadow-lg`}>
                  {service.icon}
                </div>
                <h3 className="text-green-900 mb-2">{service.title}</h3>
                <p className="text-sm text-gray-600">{service.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Reservations Section */}
      <section id="reservations" className="py-20 px-4 relative z-10">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="backdrop-blur-xl bg-white/70 rounded-3xl p-8 sm:p-12 border border-white/40 shadow-2xl"
          >
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white mb-4">
                <Calendar className="w-5 h-5" />
                <span>Reserva tu fecha</span>
              </div>
              <h2 className="font-serif text-4xl text-green-900 mb-3">Hacer una Reservación</h2>
              <p className="text-gray-600">
                Completa el formulario y te enviaremos un enlace de pago para confirmar tu reserva
              </p>
            </div>

            <form onSubmit={handleReservationSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="res-name">Nombre Completo *</Label>
                  <Input
                    id="res-name"
                    value={reservationForm.name}
                    onChange={(e) => setReservationForm({ ...reservationForm, name: e.target.value })}
                    placeholder="Tu nombre"
                    required
                    className="backdrop-blur-sm bg-white/80"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="res-email">Correo Electrónico *</Label>
                  <Input
                    id="res-email"
                    type="email"
                    value={reservationForm.email}
                    onChange={(e) => setReservationForm({ ...reservationForm, email: e.target.value })}
                    placeholder="tu@email.com"
                    required
                    className="backdrop-blur-sm bg-white/80"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="res-phone">Teléfono *</Label>
                  <Input
                    id="res-phone"
                    type="tel"
                    value={reservationForm.phone}
                    onChange={(e) => setReservationForm({ ...reservationForm, phone: e.target.value })}
                    placeholder="+593 99 999 9999"
                    required
                    className="backdrop-blur-sm bg-white/80"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="res-guests">Número de Personas *</Label>
                  <Input
                    id="res-guests"
                    type="number"
                    min="1"
                    value={reservationForm.guests}
                    onChange={(e) => setReservationForm({ ...reservationForm, guests: e.target.value })}
                    placeholder="10"
                    required
                    className="backdrop-blur-sm bg-white/80"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="res-date">Fecha *</Label>
                  <Input
                    id="res-date"
                    type="date"
                    value={reservationForm.date}
                    onChange={(e) => setReservationForm({ ...reservationForm, date: e.target.value })}
                    required
                    className="backdrop-blur-sm bg-white/80"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="res-time">Hora *</Label>
                  <Input
                    id="res-time"
                    type="time"
                    value={reservationForm.time}
                    onChange={(e) => setReservationForm({ ...reservationForm, time: e.target.value })}
                    required
                    className="backdrop-blur-sm bg-white/80"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="res-message">Mensaje Adicional (Opcional)</Label>
                <Textarea
                  id="res-message"
                  value={reservationForm.message}
                  onChange={(e) => setReservationForm({ ...reservationForm, message: e.target.value })}
                  placeholder="Cuéntanos sobre tu evento..."
                  rows={4}
                  className="backdrop-blur-sm bg-white/80"
                />
              </div>

              <Button
                type="submit"
                disabled={submittingReservation || !user}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg hover:shadow-xl"
                size="lg"
              >
                {submittingReservation ? 'Procesando...' : 
                 !user ? 'Inicia sesión para reservar' : 
                 'Enviar Reservación'}
              </Button>

              {!user && (
                <p className="text-center text-sm text-gray-600">
                  Debes{' '}
                  <button
                    type="button"
                    onClick={onLoginClick}
                    className="text-green-700 hover:underline"
                  >
                    iniciar sesión
                  </button>
                  {' '}para hacer una reservación
                </p>
              )}
            </form>
          </motion.div>
        </div>
      </section>

      {/* Experiences/Testimonials Section */}
      <section id="experiences" className="py-20 px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl sm:text-5xl text-green-900 mb-4">Experiencias de Nuestros Visitantes</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Lee lo que nuestros clientes dicen sobre sus momentos en Marianita de Jesús
            </p>
          </div>

          {/* Add testimonial form */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="backdrop-blur-xl bg-white/70 rounded-2xl p-6 sm:p-8 border border-white/40 shadow-xl mb-12"
          >
            <h3 className="text-green-900 mb-4">Comparte tu Experiencia</h3>

            <form onSubmit={handleTestimonialSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Calificación</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setTestimonialForm({ ...testimonialForm, rating: star })}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= testimonialForm.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="testimonial-text">Tu Experiencia *</Label>
                <Textarea
                  id="testimonial-text"
                  value={testimonialForm.text}
                  onChange={(e) => setTestimonialForm({ ...testimonialForm, text: e.target.value })}
                  placeholder="Cuéntanos sobre tu visita..."
                  rows={4}
                  required
                  className="backdrop-blur-sm bg-white/80"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="testimonial-image">Imagen (Opcional)</Label>
                <div className="flex gap-3">
                  <Input
                    id="testimonial-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage || !user}
                    className="backdrop-blur-sm bg-white/80"
                  />
                  {uploadingImage && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600" />
                      Subiendo...
                    </div>
                  )}
                </div>
                {testimonialForm.image_url && (
                  <img
                    src={testimonialForm.image_url}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                )}
              </div>

              <Button
                type="submit"
                disabled={submittingTestimonial || !user}
                className="bg-gradient-to-r from-green-600 to-green-700 text-white"
              >
                {submittingTestimonial ? 'Publicando...' : 
                 !user ? 'Inicia sesión para comentar' : 
                 'Publicar Experiencia'}
              </Button>

              {!user && (
                <p className="text-sm text-gray-600">
                  Debes{' '}
                  <button
                    type="button"
                    onClick={onLoginClick}
                    className="text-green-700 hover:underline"
                  >
                    iniciar sesión
                  </button>
                  {' '}para compartir tu experiencia
                </p>
              )}
            </form>
          </motion.div>

          {/* Display testimonials */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="backdrop-blur-xl bg-white/70 rounded-2xl p-6 border border-white/40 shadow-lg"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-green-900">{testimonial.userName}</p>
                    <div className="flex gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < testimonial.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 text-sm mb-3">{testimonial.text}</p>

                {testimonial.image_url && (
                  <img
                    src={testimonial.image_url}
                    alt="Experiencia"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                )}
              </motion.div>
            ))}
          </div>

          {testimonials.length === 0 && (
            <div className="text-center py-12 backdrop-blur-xl bg-white/70 rounded-2xl border border-white/40">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Sé el primero en compartir tu experiencia</p>
            </div>
          )}
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-20 px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl sm:text-5xl text-green-900 mb-4">Galería</h2>
            <p className="text-gray-600">Descubre la belleza de nuestros espacios</p>
          </div>

          {/* Main carousel image */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="relative backdrop-blur-xl bg-white/70 rounded-3xl overflow-hidden border-8 border-green-800 shadow-2xl mb-6 p-4"
          >
            <div className="aspect-video relative rounded-2xl overflow-hidden border-4 border-green-600 shadow-lg">
              <img
                src={galleryImages[currentImageIndex]}
                alt={`Galería ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
              />
              
              {/* Navigation buttons */}
              <button
                onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1))}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full backdrop-blur-md bg-white/80 border border-white/40 flex items-center justify-center hover:bg-white transition-all shadow-lg"
              >
                <ChevronLeft className="w-6 h-6 text-green-800" />
              </button>
              
              <button
                onClick={() => setCurrentImageIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1))}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full backdrop-blur-md bg-white/80 border border-white/40 flex items-center justify-center hover:bg-white transition-all shadow-lg"
              >
                <ChevronRight className="w-6 h-6 text-green-800" />
              </button>
            </div>
          </motion.div>

          {/* Thumbnail grid */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
            {galleryImages.map((img, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.05 }}
                onClick={() => setCurrentImageIndex(index)}
                className={`aspect-square rounded-xl overflow-hidden border-4 transition-all shadow-md ${
                  currentImageIndex === index
                    ? 'border-green-700 ring-2 ring-green-500 scale-95'
                    : 'border-green-400 hover:border-green-600'
                }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover hover:brightness-110 transition-all"
                />
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section id="location" className="py-20 px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl sm:text-5xl text-green-900 mb-4">Ubicación / Cómo Llegar</h2>
            <p className="text-gray-600">Encuéntranos fácilmente y planifica tu visita</p>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="backdrop-blur-xl bg-white/70 rounded-3xl p-6 sm:p-8 border border-white/40 shadow-2xl"
          >
            {/* Christmas lights decoration */}
            <div className="relative mb-6">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-300 via-red-400 to-green-400 rounded-full opacity-40" />
            </div>

            {/* Google Maps */}
            <div className="rounded-2xl overflow-hidden border-4 border-green-700 shadow-xl mb-6">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31911.465510740432!2d-80.36886183518067!3d-1.206904753740429!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x902b8b2a23d6091d%3A0xe4a2e654c45f0f1f!2sQuinta%20Agroecol%C3%B3gica%20%22Marianita%20de%20Jes%C3%BAs%22!5e0!3m2!1ses-419!2sec!4v1765673674330!5m2!1ses-419!2sec" 
                width="100%" 
                height="300"
                style={{border:0}} 
                allowFullScreen 
                loading="lazy"
                className="w-full sm:h-96"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Button
                onClick={() => window.open('https://www.google.com/maps/dir/?api=1&destination=Quinta+Agroecol%C3%B3gica+Marianita+de+Jes%C3%BAs', '_blank')}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
              >
                <Navigation className="w-5 h-5 mr-2" />
                Cómo Llegar
              </Button>
              <Button
                onClick={() => window.open('https://www.google.com/maps/place/Quinta+Agroecol%C3%B3gica+%22Marianita+de+Jes%C3%BAs%22/@-1.206904753740429,-80.36886183518067,15z', '_blank')}
                variant="outline"
                className="backdrop-blur-sm bg-white/80"
              >
                <MapPin className="w-5 h-5 mr-2" />
                Ver Ubicación
              </Button>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200">
              <div className="flex items-start gap-3">
                <Download className="w-5 h-5 text-amber-700 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-amber-900">
                    <strong>Recomendación:</strong> Descarga la ruta en tu dispositivo para navegar sin conexión
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 relative z-10 pb-32">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl sm:text-5xl text-green-900 mb-4">Contáctanos</h2>
            <p className="text-gray-600">Estamos aquí para ayudarte a planificar tu evento perfecto</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="backdrop-blur-xl bg-white/70 rounded-2xl p-8 border border-white/40 shadow-xl space-y-6"
            >
              <div>
                <h3 className="text-green-900 mb-4 flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Correo Electrónico
                </h3>
                <a
                  href="mailto:reservas.marianitadejesus@proton.me"
                  className="text-green-700 hover:underline flex items-center gap-2"
                >
                  <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-white" />
                  </div>
                  reservas.marianitadejesus@proton.me
                </a>
              </div>

              <div>
                <h3 className="text-green-900 mb-4 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp
                </h3>
                <div className="space-y-3">
                  <a
                    href={`https://wa.me/593999693683?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg bg-green-50/80 border border-green-200 hover:bg-green-100/80 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Administrador 1</p>
                      <p className="text-green-800">+593 99 969 3683</p>
                    </div>
                  </a>

                  <a
                    href={`https://wa.me/593981396030?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg bg-green-50/80 border border-green-200 hover:bg-green-100/80 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Administrador 2</p>
                      <p className="text-green-800">+593 98 139 6030</p>
                    </div>
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Social media */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="backdrop-blur-xl bg-white/70 rounded-2xl p-8 border border-white/40 shadow-xl"
            >
              <h3 className="text-green-900 mb-6">Síguenos en Redes Sociales</h3>
              
              <div className="space-y-4">
                <a
                  href="https://www.facebook.com/Quinta-recreacional-Marianita-de-Jesus-107005494487735/?ref=page_internal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-xl bg-blue-50/80 border border-blue-200 hover:bg-blue-100/80 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
                    <Facebook className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-blue-900">Facebook</p>
                    <p className="text-sm text-blue-700">Quinta Marianita de Jesús</p>
                  </div>
                </a>

                <div className="flex items-center gap-4 p-4 rounded-xl bg-pink-50/80 border border-pink-200">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                    <Instagram className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-pink-900">Instagram</p>
                    <p className="text-sm text-pink-700">Próximamente</p>
                  </div>
                </div>

                <a
                  href="https://www.tiktok.com/@marianitadejesussantaana?_r=1&_t=ZM-92KR5UBU2IK"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-xl bg-gray-50/80 border border-gray-200 hover:bg-gray-100/80 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center">
                    <Music className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-900">TikTok</p>
                    <p className="text-sm text-gray-700">@marianitadejesussantaana</p>
                  </div>
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
