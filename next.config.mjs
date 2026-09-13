const nextConfig = {
  // Todas las rutas del dashboard son `force-dynamic`: desactivamos el
  // Router Cache del cliente para que una pestaña que ya tenía una página
  // abierta siempre vea datos frescos al navegar a ella, en vez de servir
  // una versión en caché de hasta 30s (p. ej. la pestaña de Clubes mostrando
  // "sin encargado" tras crear uno desde Encargados en otra pestaña/ruta).
  experimental: {
    staleTimes: { dynamic: 0 },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;