interface SpotlightItem {
  id: string;
  name: string;
  imageUrl: string;
  modelUrl?: string; // optional, dùng sau khi có 3D
  collectionId: string;
}