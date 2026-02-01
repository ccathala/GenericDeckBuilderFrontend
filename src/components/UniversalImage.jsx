/**
 * Composant Image avec gestion automatique des URLs dev/prod
 */

import React, { useState } from "react";
import { resolveImageUrl } from "../config/api";

const UniversalImage = ({
  src,
  alt,
  className = "",
  loading = "lazy",
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const imageUrl = resolveImageUrl(src);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setIsLoading(false);
      console.warn(`Image non trouvée: ${src} → ${imageUrl}`);
    }
  };

  return (
    <div className="relative">
      <img
        src={imageUrl}
        alt={alt}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        className={`
          ${isLoading ? "opacity-0" : "opacity-100"} 
          ${hasError ? "opacity-50 bg-gray-200" : ""} 
          transition-opacity duration-200 
          ${className}
        `}
        {...props}
      />
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500 text-sm">
          Image non disponible
        </div>
      )}
    </div>
  );
};

export default UniversalImage;
