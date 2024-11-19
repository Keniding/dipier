// src/app/models/cart.types.ts

export interface Producto {
  id: string;
  name: string;
  description: string;
  skuCode: string;
  price: number;
  categories: { id: string; name: string }[];
  imageUrl?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
}

export interface CreateCartItem {
  productId: string;
  quantity: number;
}

export interface Cart {
  id: string;
  customerId: string;
  items: CartItem[];
  status: 'ACTIVE' | 'ARCHIVED' | 'COMPLETED' | 'EXPIRED';
  createdDate: Date;
}

export interface ImageState {
  imageLoading: boolean;
  imageError: boolean;
  imageLoaded: boolean;
  imageUrl: string;
}

export interface UpdateState {
  updating: boolean;
  error?: string;
}

// La interfaz principal que combina todo
export interface CartProductItem extends Producto, CartItem {
  updating: boolean;
  error?: string;
  imageLoading: boolean;
  imageError: boolean;
  imageLoaded: boolean;
  imageUrl: string;
}

// Interfaces específicas para el servicio Minio
export interface MinioResponseMetadata {
  nombre_original: string;
  mime_type: string;
  tamanio: string;
  hash_md5: string;
  fecha_subida: string;
  object_id: string;
}

export interface MinioResponseItem {
  estado: string;
  url: string;
  nombreArchivo: string;
  metadata: MinioResponseMetadata;
  tamanio: number;
  tipoContenido: string;
  ultimaModificacion: string;
  tiempoExpiracion: string;
}
