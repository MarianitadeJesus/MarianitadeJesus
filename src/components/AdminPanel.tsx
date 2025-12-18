import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Eye, EyeOff, Trash2, Edit, Check, XCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';
import { supabase } from '../utils/supabase/client';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  accessToken: string;
}

export function AdminPanel({ isOpen, onClose, accessToken }: AdminPanelProps) {
  const [reservations, setReservations] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingReservation, setEditingReservation] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      loadReservations();
      loadTestimonials();
    }
  }, [isOpen]);

  const loadReservations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReservations(data || []);
    } catch (error: any) {
      toast.error('Error cargando reservaciones: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTestimonials(data || []);
    } catch (error: any) {
      toast.error('Error cargando testimonios: ' + error.message);
    }
  };

  const updateReservationStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('reservations')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      toast.success('Estado actualizado');
      loadReservations();
    } catch (error: any) {
      toast.error('Error actualizando estado: ' + error.message);
    }
  };

  const deleteReservation = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta reservación?')) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9ecaab6b/reservations/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        toast.success('Reservación eliminada');
        loadReservations();
      } else {
        const data = await response.json();
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast.error('Error eliminando reservación: ' + error.message);
    }
  };

  const updateReservation = async () => {
    if (!editingReservation) return;

    try {
      const { error } = await supabase
        .from('reservations')
        .update({
          date: editingReservation.date,
          time: editingReservation.time,
        })
        .eq('id', editingReservation.id);

      if (error) throw error;
      toast.success('Reservación actualizada');
      setEditingReservation(null);
      loadReservations();
    } catch (error: any) {
      toast.error('Error actualizando reservación: ' + error.message);
    }
  };

  const toggleTestimonialVisibility = async (id: string, currentHidden: boolean) => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .update({ hidden: !currentHidden })
        .eq('id', id);

      if (error) throw error;
      toast.success(currentHidden ? 'Testimonio mostrado' : 'Testimonio ocultado');
      loadTestimonials();
    } catch (error: any) {
      toast.error('Error actualizando testimonio: ' + error.message);
    }
  };

  const deleteTestimonial = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este testimonio?')) return;

    try {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Testimonio eliminado');
      loadTestimonials();
    } catch (error: any) {
      toast.error('Error eliminando testimonio: ' + error.message);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pendiente: 'bg-amber-100 text-amber-800 border-amber-200',
      confirmada: 'bg-green-100 text-green-800 border-green-200',
      cancelada: 'bg-red-100 text-red-800 border-red-200',
    };
    return styles[status as keyof typeof styles] || styles.pendiente;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto backdrop-blur-xl bg-white/95 border border-white/20">
        <DialogHeader>
          <DialogTitle className="font-serif text-3xl text-amber-800">
            Panel de Administración
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="reservations" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="reservations">Reservaciones</TabsTrigger>
            <TabsTrigger value="testimonials">Testimonios</TabsTrigger>
          </TabsList>

          <TabsContent value="reservations" className="space-y-4">
            {loading ? (
              <div className="text-center py-8 text-gray-500">Cargando...</div>
            ) : reservations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No hay reservaciones</div>
            ) : (
              <div className="space-y-3">
                {reservations.map((reservation) => (
                  <div
                    key={reservation.id}
                    className="p-4 rounded-lg border border-gray-200 bg-white/50 backdrop-blur-sm"
                  >
                    {editingReservation?.id === reservation.id ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>Fecha</Label>
                            <Input
                              type="date"
                              value={editingReservation.date}
                              onChange={(e) => setEditingReservation({
                                ...editingReservation,
                                date: e.target.value
                              })}
                            />
                          </div>
                          <div>
                            <Label>Hora</Label>
                            <Input
                              type="time"
                              value={editingReservation.time}
                              onChange={(e) => setEditingReservation({
                                ...editingReservation,
                                time: e.target.value
                              })}
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={updateReservation}
                            size="sm"
                            className="bg-green-600"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Guardar
                          </Button>
                          <Button
                            onClick={() => setEditingReservation(null)}
                            size="sm"
                            variant="outline"
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="text-sm text-gray-600">Cliente: {reservation.name}</p>
                            <p className="text-sm text-gray-600">Email: {reservation.userEmail}</p>
                            <p className="text-sm text-gray-600">Teléfono: {reservation.phone}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs border ${getStatusBadge(reservation.status)}`}>
                            {reservation.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span>{reservation.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span>{reservation.time}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-gray-600">Personas: {reservation.guests}</span>
                          </div>
                          {reservation.message && (
                            <div className="col-span-2">
                              <p className="text-gray-600 text-sm">Mensaje: {reservation.message}</p>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Select
                            value={reservation.status}
                            onValueChange={(value) => updateReservationStatus(reservation.id, value)}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pendiente">Pendiente</SelectItem>
                              <SelectItem value="confirmada">Confirmada</SelectItem>
                              <SelectItem value="cancelada">Cancelada</SelectItem>
                            </SelectContent>
                          </Select>

                          <Button
                            onClick={() => setEditingReservation(reservation)}
                            size="sm"
                            variant="outline"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Editar
                          </Button>

                          <Button
                            onClick={() => deleteReservation(reservation.id)}
                            size="sm"
                            variant="outline"
                            className="border-red-200 text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Eliminar
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="testimonials" className="space-y-4">
            {testimonials.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No hay testimonios</div>
            ) : (
              <div className="space-y-3">
                {testimonials.map((testimonial) => (
                  <div
                    key={testimonial.id}
                    className={`p-4 rounded-lg border bg-white/50 backdrop-blur-sm ${
                      testimonial.hidden ? 'border-red-200 bg-red-50/50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">{testimonial.userName}</p>
                        <p className="text-sm text-gray-600">{testimonial.userEmail}</p>
                        <div className="flex gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={i < testimonial.rating ? 'text-amber-500' : 'text-gray-300'}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                      {testimonial.hidden && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full border border-red-200">
                          Oculto
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-700 mb-3">{testimonial.text}</p>

                    {testimonial.image_url && (
                      <img
                        src={testimonial.image_url}
                        alt="Testimonio"
                        className="w-32 h-32 object-cover rounded-lg mb-3"
                      />
                    )}

                    <div className="flex gap-2">
                      <Button
                        onClick={() => toggleTestimonialVisibility(testimonial.id, testimonial.hidden)}
                        size="sm"
                        variant="outline"
                      >
                        {testimonial.hidden ? (
                          <>
                            <Eye className="w-4 h-4 mr-1" />
                            Mostrar
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-4 h-4 mr-1" />
                            Ocultar
                          </>
                        )}
                      </Button>

                      <Button
                        onClick={() => deleteTestimonial(testimonial.id)}
                        size="sm"
                        variant="outline"
                        className="border-red-200 text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
