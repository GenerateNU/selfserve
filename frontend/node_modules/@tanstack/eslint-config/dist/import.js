//#region src/import.ts
/**
* @see https://github.com/un-ts/eslint-plugin-import-x
*/
const importRules = {
	"import/consistent-type-specifier-style": ["error", "prefer-top-level"],
	"import/first": "error",
	"import/newline-after-import": "error",
	"import/no-commonjs": "error",
	"import/no-duplicates": "error",
	"import/order": ["error", { groups: [
		"builtin",
		"external",
		"internal",
		"parent",
		"sibling",
		"index",
		"object",
		"type"
	] }]
};

//#endregion
export { importRules };
//# sourceMappingURL=import.js.map