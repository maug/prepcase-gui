import { Injectable } from '@angular/core'
import Ajv from 'ajv'
import draft6MetaSchema from 'ajv/dist/refs/json-schema-draft-06.json'

@Injectable({
  providedIn: 'root',
})
export class SchemaValidationService {
  private ajv: Ajv

  constructor() {
    this.ajv = new Ajv({ verbose: true })
    this.ajv.addMetaSchema(draft6MetaSchema)
  }

  validate(jsonSchema: object, data: object) {
    const validate = this.ajv.compile(jsonSchema)
    if (!validate(data)) {
      console.log('errors', validate.errors)
      throw new Error(
        `ERROR: Invalid JSON.\n\n` +
          `${validate.errors
            ?.map(
              (err) =>
                `- ${err.message} (${err.instancePath})\n` +
                `${Object.entries(err.params).map(([key, value]) => `${key}: ${value}`)}\n` +
                `node: ${JSON.stringify(err.data, null, ' ')}`
            )
            .join('\n\n')}\n\n` +
          `INPUT:\n\n` +
          `${JSON.stringify(data, null, ' ')}`
      )
    }

    return true
  }
}
