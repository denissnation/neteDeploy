type Vehicle = {
  vehicle_id: number;
  vehicle_name: string;
  vehicle_price: string;
  vehicle_power: string;
  vehicle_torsi: string;
  vehicle_machine: string;
  vehicle_model: string;
  vehicle_banner: string;
  vehicle_img: string;
};
type Feature = {
  feature_id: number;
  feature_name: string;
  featuresVehicle_id: number;
  feature_img: string;
};

type Category = {
  category_id: number;
  category_name: string;
};

type test = {
  id: number;
  name: string;
};

interface NewsItem {
  news_id: number;
  news_title: string;
  news_body: string;
  created_at: string;
  news_image: string;
}

interface NewsResponse {
  news: NewsItem[];
  hasMore: boolean;
}
declare global {
  type AuthUser = {
    id: string;
    email: string;
    role: string;
  } | null;
}
