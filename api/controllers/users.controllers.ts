import { Request, Response } from "express";
import { transporter } from "../config/mailer.config";
import User from "../models/User.models";
import { createToken, verifyToken } from "../config/tokens";
import { UsersServices } from "../services/users.services";
import { validateAuth } from "../middlewares/auth";
import { recoverPassword } from "../utils/emailNodemailer";

const port = process.env.LOCAL_HOST_FRONT;

class UsersControllers {
  static getAllUsers(req: Request, res: Response) {
    const page: number = parseInt(req.query.page as string) || 1;
    UsersServices.getAll(page)
      .then((users) => res.status(200).send(users))
      .catch((err: Error) => res.send(err));
  }

  static registerUser(req: Request, res: Response) {
    UsersServices.register(req.body)
      .then((user) => {
        const payload = {
          id: user.id,
          email: user.email,
          name: user.name,
          last_name: user.last_name,
          profile_photo: user.profile_photo,
          is_admin: user.is_admin,
          is_confirmed: user.is_confirmed,
          is_enabled: user.is_enabled,
        };
        // Proceso de envío de correo omitido para entorno de prueba
        if (process.env.NODE_ENV !== "test") {
          return UsersServices.sendEmailToConfirmAccount(port, user).then(
            () => {
              return res.status(201).send(payload);
            }
          );
        } else {
          // En un entorno de prueba, simplemente responde con éxito
          return res.status(201).send(payload);
        }
      })
      .catch((err) => res.status(409).send(err.message));
  }

  static confirmEmail(req: Request, res: Response) {
    const { token } = req.params;
    if (!token) return res.sendStatus(401);

    return UsersServices.confirmEmail(token)
      .then(([affectedRows, [updatedUser]]) => {
        if (affectedRows === 0 || !updatedUser) return res.sendStatus(401);
        return res.status(200).send(`User ${updatedUser.email} confirmed`);
      })
      .catch(() => {
        res.status(500).send("Error confirming user!");
      });
  }

  static async resendEmail(req: Request, res: Response) {
    const { token } = req.params;

    const user = await UsersServices.findOneUserByToken(token);
    if (!user) return res.sendStatus(500);
    try {
      const message = await UsersServices.sendEmailToConfirmAccount(port, user);
      return res.status(200).send(message);
    } catch (err) {
      return res.status(500).send(err);
    }
  }

  static loginUser(req: Request, res: Response) {
    UsersServices.login(req.body)
      .then((response) =>
        res
          .status(200)
          .cookie("authToken", response.token, {
            sameSite: "none",
            httpOnly: true,
            secure: true,
          })
          .send(response.payload)
      )
      .catch((err) => {
        if (
          err.message === "Please confirm your account before trying to log in"
        )
          return res.status(412).send(err.message);
        return res.status(401).send(err.message);
      });
  }

  static logout(_req: Request, res: Response) {
    res.clearCookie("authToken");
    res.sendStatus(204);
  }

  static getDeliverymen(req: Request, res: Response) {
    const page: number = parseInt(req.query.page as string) || 1;
    UsersServices.getDeliverymen(page)
      .then((deliverymen) => res.status(200).send(deliverymen))
      .catch(() => {
        res.status(500).send("Error getting deliverymen!");
      });
  }

  static getDeliverymenWithPackagesQuantityByDate(req: Request, res: Response) {
    const page: number = parseInt(req.query.page as string) || 1;
    const { date } = req.params;
    UsersServices.getDeliverymenWithPackagesQuantityByDate(page, 15, date)
      .then((deliverymen) => res.status(200).send(deliverymen))
      .catch(() => {
        res.status(500).send("Error getting deliverymen!");
      });
  }

  static GetNumberOfDeliverymenAndEnadledDeliverymen(
    _req: Request,
    res: Response
  ) {
    interface Deliveryman {
      id: number;
      is_enabled: boolean;
    }
    UsersServices.GetNumberOfDeliverymenAndEnadledDeliverymen()
      .then((deliverymen: Deliveryman[]) => {
        const enabledDeliverymen = deliverymen.filter(
          (deliveryman) => deliveryman.is_enabled
        );
        res.status(200).send({
          enabledDeliverymenQuantity: enabledDeliverymen.length,
          deliverymenQuantity: deliverymen.length,
        });
      })
      .catch(() => {
        res.status(500).send("Error getting deliverymen!");
      });
  }

  static getUser(req: Request, res: Response) {
    if (!Number.isInteger(parseInt(req.params.id))) {
      return res.status(400).send("Id de usuario no válido");
    }
    return UsersServices.getUser(parseInt(req.params.id))
      .then((user) => {
        if (!user) return res.sendStatus(204);
        const payload = {
          id: user.id,
          email: user.email,
          name: user.name,
          last_name: user.last_name,
          profile_photo: user.profile_photo,
          is_admin: user.is_admin,
          is_confirmed: user.is_confirmed,
          is_enabled: user.is_enabled,
        };
        return res.status(200).send(payload);
      })
      .catch(() => {
        res.status(500).send("Error getting user!");
      });
  }

  static getUserByEmail(req: Request, res: Response) {
    UsersServices.findOneUserByEmail(req.params.email)
      .then((user) => {
        if (!user) return res.sendStatus(204);
        const payload = {
          id: user.id,
          email: user.email,
          name: user.name,
          last_name: user.last_name,
          profile_photo: user.profile_photo,
          is_admin: user.is_admin,
          token: user.token,
        };
        return res.status(200).send(payload);
      })
      .catch((err) => res.status(400).send(err));
  }

  static deleteDeliveryman(req: Request, res: Response) {
    UsersServices.deleteDeliveryman(req.body.email)
      .then(() => res.status(200).send("Deliveryman deleted successfully"))
      .catch(() =>
        res.status(500).send("Failure when trying to delete delivery man")
      );
  }

  static deleteAdmin(req: Request, res: Response) {
    const { email } = req.body;

    UsersServices.deleteAdmin(email)
      .then((response) => res.status(200).send(response))
      .catch((err) => res.status(500).send(err.message));
  }

  static sendEmail(req: Request, res: Response) {
    const email = req.body.email;

    UsersServices.findOneUserByEmail(email)
      .then((user: User | null) => {
        if (!user) {
          return res.status(404).send("Email does not exist");
        }
        if (!user.is_confirmed) {
          return res
            .status(401)
            .send("You must confirm email before restoring password");
        }
        //Si el usuario existe va a generar un token
        const payload = {
          email: user.email,
          name: user.name,
          last_name: user.last_name,
          profile_photo: user.profile_photo,
          is_admin: user.is_admin,
          is_confirmed: user.is_confirmed,
          is_enabled: user.is_enabled,
        };

        const token = createToken(payload, "10m");
        user.token = token;

        return user.save().then(() => {
          if (process.env.NODE_ENV !== "test") {
            // Genera el link de recuperación de contraseña y lo envía por correo
            const restorePasswordURL = `http://localhost:3001/new-password/${user.token}`;
            //const restorePasswordURL = `http://3.23.20.217:3001/new-password/${user.token}`;
            return transporter
              .sendMail(recoverPassword(user, restorePasswordURL))
              .then(() => {
                return res.status(200).send(user.email);
              });
          } else {
            // En un entorno de prueba, simplemente responde con éxito sin enviar el correo
            return res.sendStatus(200);
          }
        });
      })
      .catch((error) => {
        console.error("Error when trying to restore password:", error);
        res.status(500).send("Internal Server Error");
      });
  }

  /*  Una vez que el usuario recibe el correo con el link para cambiar la contraseña
  se procede a validar el token para mostrar en el front el formulario para 
  ingresar la nueva contraseña*/
  static validateTokenToRestorePassword(req: Request, res: Response) {
    const { token } = req.params;
    if (!token) return res.sendStatus(401);

    const user = verifyToken(token);
    if (!user) return res.sendStatus(401);

    return UsersServices.findOneUserByToken(token)
      .then((user) => {
        if (!user) return res.sendStatus(401);
        return res.sendStatus(200);
      })
      .catch((error) => {
        console.error("Error when trying to validate token:", error);
        return res.status(500).send("Internal Server Error");
      });
  }

  /* En el momento en que el usuario le de click para confirmar la nueva contraseña y haya
  pasado las validaciones del front vuelve a verificar si el token sigue siendo válido o 
  si no ha expirado y luego se guarda la nueva contraseña*/
  static overwritePassword(req: Request, res: Response) {
    const { token } = req.params;
    const { password } = req.body;
    if (!token)
      return res.status(401).send({ message: "Token does not exist" });

    try {
      const user = verifyToken(token);
      // eslint-disable-next-line no-console
      console.log("respuesta de verify token", user);

      if (!user) return res.sendStatus(401);
      if (!password) return res.sendStatus(400).send("Password is required!");
      return UsersServices.findOneUserByToken(token)
        .then((user: User | null) => {
          if (!user) return res.sendStatus(401);

          user.token = null;
          user.password = password;
          return user.save().then(() => {
            return res.sendStatus(200);
          });
        })
        .catch((error) => {
          console.error("Error when trying to overwrite password:", error);
          return res.status(500).send(error);
        });
    } catch (error) {
      if ((error as Error).message === "Token has expired") {
        return res.status(401).send({ message: "Token has expired" });
      } else {
        console.error("Error when verifying token:", error);
        return res.status(500).send(error);
      }
    }
  }

  static me(req: Request, res: Response) {
    validateAuth(req, res, () => {
      const user = req.payload;
      res.status(200).send(user);
    });
  }

  static enableDeliveryman(req: Request, res: Response) {
    UsersServices.enableDeliveryman(parseInt(req.params.id))
      .then((resp) => {
        if (resp /*[0] === 1*/) res.status(200).send(resp[0]);
        else {
          res.status(422).send("error updating user");
        }
      })
      .catch((error) => {
        console.error("Error when trying to enable user:", error);
        return res.status(500).send("Internal Server Error");
      });
  }

  static disableDeliveryman(req: Request, res: Response) {
    UsersServices.disableDeliveryman(parseInt(req.params.id))
      .then((resp) => {
        if (resp /*[0] === 1*/) res.status(200).send(resp[0]);
        else {
          res.status(422).send("error updating user");
        }
      })
      .catch((error) => {
        console.error("Error when trying to disable user:", error);
        return res.status(500).send("Internal Server Error");
      });
  }
}
export { UsersControllers };
