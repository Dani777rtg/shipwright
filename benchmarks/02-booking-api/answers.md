# Respuestas fijas de la entrevista

- Usuarios: socios (reservan, cancelan) y personal (crea clases, ve asistentes); 2.000 socios, pico de 200 reservas por minuto al abrir cupos los lunes 6:00.
- Objetivo: eliminar reservas por WhatsApp y el sobrecupo.
- Métricas: 0 sobrecupos; p95 < 300 ms en el pico; 90% de reservas por la API al mes.
- Calidad (orden): fiabilidad, seguridad, rendimiento.
- Reglas: cancelar hasta 2 h antes; máximo 3 reservas activas por socio; lista de espera automática.
- Datos: nombre, email, teléfono de socios (personales); conservar 2 años.
- Usuarios en Colombia.
- Autenticación: email + contraseña con roles socio/personal; el equipo móvil necesita un contrato OpenAPI.
- Plataforma: AWS.
- Idioma de docs: español; API en inglés.
- Fuera de alcance: pagos.
- Plazo: 2 semanas.
