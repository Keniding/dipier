import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApiService } from "./common/base-api-service.service";
import { environment } from "../../environments/environment";

interface MinioMetadata {
  nombre_original: string;
  mime_type: string;
  tamanio: string;
  hash_md5: string;
  fecha_subida: string;
  object_id: string;
}

interface MinioResponse {
  estado: string;
  url: string;
  nombreArchivo: string;
  metadata: MinioMetadata;
  tamanio: number;
  tipoContenido: string;
  ultimaModificacion: string;
  tiempoExpiracion: string;
}

@Injectable({
  providedIn: 'root'
})
export class MinioService extends BaseApiService {
  private apiUrl = `${environment.apiUrl}/files`;

  constructor(private http: HttpClient) {
    super();
  }

  getObjectById(objectId: string): Observable<MinioResponse[]> {
    console.log('Headers en GET:', this.createHeaders().keys());
    return this.http.get<MinioResponse[]>(
      `${this.apiUrl}/object/${objectId}`,
      { headers: this.createHeaders() }
    );
  }

  uploadFile(file: File, objectId: string): Observable<MinioResponse[]> {
    const headers = this.createUploadHeaders();
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<MinioResponse[]>(
      `${this.apiUrl}/upload/${objectId}`,
      formData,
      { headers }
    );
  }

  deleteFile(objectId: string, fileName: string): Observable<any> {
    const headers = this.createHeaders();
    return this.http.delete(
      `${this.apiUrl}/${objectId}/${fileName}`,
      { headers }
    );
  }
}
