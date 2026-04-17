import './SplineScene.css';

export function SplineScene({ scene, className }) {
  // Derive the embed URL from the scene code URL
  // prod.spline.design/{id}/scene.splinecode → my.spline.design/{id}/
  const embedUrl = scene.replace('https://prod.spline.design/', 'https://my.spline.design/').replace('/scene.splinecode', '/');

  return (
    <iframe
      src={embedUrl}
      className={`spline-iframe ${className || ''}`}
      frameBorder="0"
      title="3D Scene"
      allow="autoplay"
    />
  );
}
