type User = {
  email: string;
};

export const registeredSuccesfully = (user: User, confirmURL: string) => {
  return {
    from: '"Confirmación de correo electrónico" <appboxdelivery.mailing@gmail.com>',
    to: user.email,
    subject: "Confirmación de correo ✔",
    html: `
    <h1>Hola! Te has registrado exitosamente!</h1> <br />
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
