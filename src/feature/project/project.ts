import { Command } from "commander";
import fs from "fs";
import path from "path";
import { findData, findKeyTypes, findProperties } from "./extractKeyType";
import { generateBaseSchema } from "./generateSchema";
import { createDefaultDir } from "../../infrastructure/utility/FileUitl";
import { projectRepository } from "./data/projectRepositoryImpl";
import { organizationRepository } from "../organization/data/OrganizationRepositoryImpl";

export function project(program: Command) {
  return program.command("project").description("Manage project");
}

export function projectList(program: Command) {
  return program
    .command("list")
    .description("List of projects")
    .action(async () => {
      const organization = await organizationRepository.get();
      if (organization.onSuccess) {
        const result = await projectRepository.projects(organization.onSuccess ?? "");
        if (result.onSuccess) {
          console.table(result.onSuccess);
        } else {
          console.log(result.onError);
        }
      } else {
        console.log(organization.onError);
      }
    });
}

export function setProject(program: Command) {
  return program
    .command("set")
    .description("Set the project")
    .option("-id, --id", "Project id")
    .argument("<id>", "Project id")
    .action(async (id) => {
      const result = await projectRepository.set(id);
      if (result.onSuccess) {
        console.log(result.onSuccess);
      } else {
        console.error(result.onError);
      }
    });
}

export function getProject(program: Command) {
  return program
    .command("get")
    .description("Get the active project")
    .action(async () => {
      const result = await projectRepository.get();
      if (result.onSuccess) {
        console.log(result.onSuccess);
      } else {
        console.error(result.onError);
      }
    });
}

export function prepareSchema(program: Command) {
  return program
    .command("prepare-schema")
    .description("Prepare installed integration for schema")
    .option("-d, --directory", "Project working root directory")
    .argument("<directory>", "Project working root directory")
    .action((directory) => {
      const jsonFilePath: string = path.join(directory + "/.nativeblocks/integrations");
      if (fs.existsSync(jsonFilePath)) {
        try {
          let blockKeyTypes = [] as any[];
          let blockPropertyKeys = [] as any[];
          let blockDataKeys = [] as any[];
          let actionKeyTypes = [] as any[];
          let actionPropertyKeys = [] as any[];
          let actionDataKeys = [] as any[];

          if (fs.existsSync(jsonFilePath + "/block")) {
            blockKeyTypes = findKeyTypes(jsonFilePath + "/block");
            blockPropertyKeys = findProperties(jsonFilePath + "/block");
            blockDataKeys = findData(jsonFilePath + "/block");
          }

          if (fs.existsSync(jsonFilePath + "/action")) {
            actionKeyTypes = findKeyTypes(jsonFilePath + "/action");
            actionPropertyKeys = findProperties(jsonFilePath + "/action");
            actionDataKeys = findData(jsonFilePath + "/action");
          }

          const schema = generateBaseSchema(
            new Set(["ROOT", ...blockKeyTypes]),
            new Set(actionKeyTypes),
            blockPropertyKeys,
            blockDataKeys,
            actionPropertyKeys,
            actionDataKeys
          );

          console.log("=========================================================================================");
          const path = createDefaultDir(directory);
          fs.writeFileSync(`${path}/schema.json`, JSON.stringify(schema));
          console.log(`The result saved into ${path}/schema.json`);
          console.log("=========================================================================================");
        } catch (e) {
          console.log(e);
        }
      } else {
        console.log(`could not retrieve from ${jsonFilePath}`);
      }
    });
}

export function generateSchema(program: Command) {
  return program
    .command("gen-schema")
    .description("Generate a schema")
    .option("-d, --directory", "Project working root directory")
    .argument("<directory>", "Project working root directory")
    .action((directory) => {});
}
