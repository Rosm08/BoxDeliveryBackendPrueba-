type User = {
  name: string;
  email: string;
};

export const confirmationEmail = (user: User, confirmURL: string) => {
  return {
    from: '"Box Delivery App" <appboxdelivery.mailing@gmail.com>',
    to: user.email,
    subject: "Confirma tu correo electronico ✔",
    html: `
    <h1>Hola ${user.name}! Te has registrado exitosamente!</h1> <br />
      <p>
        Para poder acceder a nuestros servicios, por cuestiones de seguridad, <br /> te
        pedimos que confirmes tu correo haciendo click en el siguiente link, <br /> o
        copiandolo y pegandolo en tu navegador
      </p> <br/>
      <h4>
        Esperamos que difrutes nuestra plataforma
      </h4>
      <a href="${confirmURL}">${confirmURL}</a>`,
  };
};

export const recoverPassword = (user: User, restorePasswordURL: string) => {
  return {
    from: '"Box Delivery App" <appboxdelivery.mailing@gmail.com>',
    to: user.email,
    subject: "Recuperar contraseña 🤫",
    html: `
    <style>
    .underline {
      color: yellow
    }
    </style>
      <h1>Hola ${user.name}!</h1>
      <h2>Olvidaste tu contraseña? No hay problema</h2>
      <p style="font-style: italic;">
        Si no realizaste esta solicitud, por favor ignora este correo
      </p> <br/>
      <p>
      De lo contrario, <span style="font-weight: bold;"> haga clic en el enlace </span> al final del correo para cambiar su contraseña 👇
      </p> <br/>
      <p>
      "Por cuestiones de seguridad, el enlace proporcionado tiene una validez de 10 minutos. <br /> Pasado ese tiempo, usted debera realizar una nueva solicitud de recuperacion de contraseña"
      </p> <br/>
      <h4>
        Gracias, el equipo de soporte de Box Devliery App!
      </h4>
      <a href="${restorePasswordURL}">${restorePasswordURL}</a>`,
  };
};
