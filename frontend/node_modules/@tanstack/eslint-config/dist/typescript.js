//#region src/typescript.ts
/**
* @see https://typescript-eslint.io/rules/
*/
const typescriptRules = {
	"@typescript-eslint/array-type": ["error", {
		default: "generic",
		readonly: "generic"
	}],
	"@typescript-eslint/ban-ts-comment": ["error", {
		"ts-expect-error": false,
		"ts-ignore": "allow-with-description"
	}],
	"@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],
	"@typescript-eslint/method-signature-style": ["error", "property"],
	"@typescript-eslint/naming-convention": ["error", {
		selector: "typeParameter",
		format: ["PascalCase"],
		leadingUnderscore: "forbid",
		trailingUnderscore: "forbid",
		custom: {
			regex: "^(T|T[A-Z][A-Za-z]+)$",
			match: true
		}
	}],
	"@typescript-eslint/no-duplicate-enum-values": "error",
	"@typescript-eslint/no-extra-non-null-assertion": "error",
	"@typescript-eslint/no-for-in-array": "error",
	"@typescript-eslint/no-inferrable-types": ["error", { ignoreParameters: true }],
	"@typescript-eslint/no-misused-new": "error",
	"@typescript-eslint/no-namespace": "error",
	"@typescript-eslint/no-non-null-asserted-optional-chain": "error",
	"@typescript-eslint/no-unnecessary-condition": "error",
	"@typescript-eslint/no-unnecessary-type-assertion": "error",
	"@typescript-eslint/no-unsafe-function-type": "error",
	"@typescript-eslint/no-wrapper-object-types": "error",
	"@typescript-eslint/prefer-as-const": "error",
	"@typescript-eslint/prefer-for-of": "warn",
	"@typescript-eslint/require-await": "warn",
	"@typescript-eslint/triple-slash-reference": "error"
};

//#endregion
export { typescriptRules };
//# sourceMappingURL=typescript.js.map