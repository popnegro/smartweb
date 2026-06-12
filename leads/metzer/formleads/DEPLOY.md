# Deploy en Don Web

El sitio esta preparado para publicarse en:

```text
https://contacto.metzer.com.ar
```

La interfaz es HTML/CSS/JS y el envio del lead se procesa con PHP en:

```text
/api/send-lead.php
```

## DNS

En Don Web o en el proveedor DNS de `metzer.com.ar`, crear el subdominio:

```text
contacto.metzer.com.ar
```

Si el DNS no esta administrado por Don Web, crear el registro que Don Web indique para el hosting. Usualmente sera:

```text
Tipo: A
Nombre: contacto
Valor: IP del hosting
```

o:

```text
Tipo: CNAME
Nombre: contacto
Valor: host indicado por Don Web
```

## Archivos a subir

Subir estos archivos al document root del subdominio `contacto.metzer.com.ar`:

```text
index.html
styles.css
app.js
site.config.js
robots.txt
.htaccess
api/send-lead.php
assets/logo.svg
```

El archivo `assets/logo.svg` todavia debe agregarse al proyecto.

## Email

El endpoint PHP usa `mail()` del hosting.

Valores por defecto:

```text
Destino: ventas@metzer.com.ar
Remitente: no-reply@metzer.com.ar
```

Para cambiarlos sin tocar codigo, definir variables de entorno en el hosting si Don Web lo permite:

```text
LEAD_TO=comercial@metzer.com.ar
LEAD_FROM=no-reply@metzer.com.ar
```

Si el plan no permite variables de entorno, cambiar estos valores en `api/send-lead.php`:

```php
$leadTo = getenv('LEAD_TO') ?: 'ventas@metzer.com.ar';
$leadFrom = getenv('LEAD_FROM') ?: 'no-reply@metzer.com.ar';
```

## Prueba post-deploy

1. Abrir `https://contacto.metzer.com.ar`.
2. Completar un lead real de prueba.
3. Confirmar que llega a la casilla destino.
4. Revisar spam/correo no deseado.
5. Si no llega, confirmar que `mail()` este habilitado en el hosting.

## Recomendaciones

- Crear la casilla `no-reply@metzer.com.ar` o usar una casilla valida del dominio.
- Verificar SPF/DKIM/DMARC para mejorar entregabilidad.
- Si `mail()` da baja entregabilidad, migrar `api/send-lead.php` a SMTP con PHPMailer.
- Confirmar si el formulario debe indexarse. Hoy `index.html` usa `noindex,follow` por ser una pagina operativa de contacto.
