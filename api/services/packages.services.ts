import Package from "../models/Package.models";
import { formattedDate, todayDate } from "../utils/date";

type PackageData = {
  id: string;
  receiver_name: string;
  date: Date;
  weight: number;
  address: string;
  status: "ongoing" | "delivered" | "pending";
  user_id: number;
  // [key: string | symbol]: any;
};

class PackagesServices {
  static addPackage(data: PackageData) {
    return new Promise((resolve, reject) => {
      Package.create(data)
        .then((packageData) => {
          resolve(packageData);
        })
        .catch((error: Error) => {
          reject(error);
        });
    });
  }
  static getPackages(page: number = 1, pageSize: number = 15) {
    const offset = (page - 1) * pageSize;
    return Package.findAll({
      where: {
        user_id: null,
        date: formattedDate(todayDate),
        status: "pending",
      },
      offset,
      limit: pageSize,
    });
  }

  static async getNumberOfPacakgesAndPackagesDeliveredByDate(date: string) {
    return await Package.findAll({
      where: { date: date },
      attributes: {
        exclude: ["receiver_name", "date", "weight", "address", "user_id"],
      },
    })
      .then((packages) => {
        return packages;
      })
      .catch((error) => {
        return error;
      });
  }

  static getSinglePackage(packageId: string): Promise<Package | null> {
    return new Promise((resolve, reject) => {
      Package.findByPk(packageId)
        .then((singlePackage: Package | null) => resolve(singlePackage))
        .catch((error) => reject(error));
    });
  }

  static getPackagesByUserAndStatus(
    userId: number,
    status: string
  ): Promise<Package[]> {
    return new Promise((resolve, reject) => {
      Package.findAll({ where: { user_id: userId, status: status } })
        .then((packages: Package[]) => resolve(packages))
        .catch((error) => reject(error));
    });
  }
  static getPackagesByStatusAndDate(
    status: string,
    date: string
  ): Promise<Package[]> {
    return new Promise((resolve, reject) => {
      Package.findAll({
        where: {
          status: status,
          date: date,
        },
      })
        .then((packages: Package[]) => resolve(packages))
        .catch((error) => reject(error));
    });
  }
  // viejo por ahora no lo uso
  static update(id: string, status: string) {
    return Package.findOne({ where: { id: id } })
      .then((foundPackage) => {
        if (!foundPackage) {
          throw new Error("We could not find the package requested");
        }
        if (
          status === `delivered` ||
          status === `ongoing` ||
          status === `pending`
        ) {
          foundPackage.status = status;
          foundPackage.save();
          return foundPackage;
        } else throw new Error("Status type is invalid");
      })
      .catch((err) => {
        throw new Error(err);
      });
  }

  static updateStatus(packageId: string) {
    return Package.findOne({ where: { id: packageId } })
      .then((foundPackage) => {
        if (!foundPackage) {
          throw new Error("We could not find the package requested");
        }
        foundPackage.status = "ongoing";
        foundPackage.save();
        return foundPackage;
      })
      .catch((err) => {
        throw new Error(err);
      });
  }

  static async assign(packageId: string, userId: string) {
    try {
      const foundpackagesFromToday = await Package.findAll({
        where: { user_id: userId, date: formattedDate(todayDate) },
      });
      if (foundpackagesFromToday.length >= 10) {
        throw new Error("You can't deliver more than 10 packages per day");
      } else {
        const foundPackage = await Package.findOne({
          where: { id: packageId },
        });
        if (!foundPackage)
          throw new Error("We could not find the package requested");
        if (foundPackage.user_id !== null)
          throw new Error("Package already assigned to a delivery man");
        foundPackage.user_id = parseInt(userId);
        foundPackage.save();
        return foundPackage;
      }
    } catch (err) {
      throw Error(`${err}`);
    }
  }

  static finishDelivery(packageId: string) {
    return Package.findOne({ where: { id: packageId } })
      .then((foundPackage) => {
        if (!foundPackage)
          throw new Error("We could not find the package requested");
        foundPackage.status = "delivered";
        foundPackage.save();
        return foundPackage;
      })
      .catch((err) => {
        throw new Error(err);
      });
  }

  static cancelDelivery(packageId: string) {
    return Package.findOne({ where: { id: packageId } })
      .then((foundPackage) => {
        if (!foundPackage)
          throw new Error("We could not find the package requested");
        foundPackage.status = "pending";
        foundPackage.save();
        return foundPackage;
      })
      .catch((err) => {
        throw new Error(err);
      });
  }

  static removeUserFromPackage(packageId: string) {
    return Package.findOne({ where: { id: packageId } })
      .then((foundPackage) => {
        if (!foundPackage)
          throw new Error("We could not find the package requested");
        // if (foundPackage.user_id === null)
        //   throw new Error("El paquete no estaba asigando a este repartidor");
        foundPackage.user_id = null;
        return foundPackage.save();
      })
      .catch((err) => {
        throw Error(err);
      });
  }

  static reassign(packageId: string, user_id: number) {
    return Package.findOne({
      where: {
        packageId,
      },
    })
      .then((foundPackage) => {
        if (!foundPackage) return;
        foundPackage.user_id = user_id;
        foundPackage.save();
        return foundPackage;
      })
      .catch((err) => {
        throw new Error(err);
      });
  }

  static removeAllUsersFromPackages() {
    return Package.update(
      {
        user_id: null,
      },
      { where: {} }
    );
  }

  static deletePackage(id: string) {
    return Package.findOne({ where: { id } }).then((packageResponse) => {
      if (packageResponse) {
        return packageResponse
          .destroy()
          .then(() => "Package deleted successfully")
          .catch(() => {
            throw new Error("Failure when trying to delete package");
          });
      }
      throw new Error("We could not find an package associated with that id");
    });
  }

  static deletePackages() {
    return Package.destroy({ where: { user_id: !null } })
      .then(() => "Packages deleted succesfully")
      .catch(() => {
        throw new Error("Failure when trying to delete packages");
      });
  }
}

export { PackagesServices };
