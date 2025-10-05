import { RowDataPacket } from "mysql2";

export interface Vehicle {
  vehicle_id: number;
  vehicle_name: string;
  vehicle_price: string;
  vehicle_power: string;
  vehicle_torsi: string;
  vehicle_machine: string;
  vehicle_model: string;
  vehicle_banner: string;
  vehicle_img: string;
}

export interface VehicleFeature extends RowDataPacket {
  feature_id: number;
  featuresVehicle_id: number;
  feature_name: string;
  feature_img: string;
}
export interface News {
  news_id: number;
  news_title: string;
  news_body: string;
  news_image: string;
  created_at: string;
}

export interface UploadState {
  success: boolean;
  imageUrls: string[];
  error: string | null;
}
