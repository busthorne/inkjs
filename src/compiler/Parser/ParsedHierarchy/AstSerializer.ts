import { ParsedObject } from "./Object";
import { Story } from "./Story";
import { FlowBase } from "./Flow/FlowBase";
import { Text } from "./Text";
import { Expression } from "./Expression/Expression";
import { ListDefinition } from "./List/ListDefinition";
import { ExternalDeclaration } from "./Declaration/ExternalDeclaration";
import { ConstantDeclaration } from "./Declaration/ConstantDeclaration";
import { DebugMetadata } from "../../../engine/DebugMetadata";

interface AstNode {
	type: string;
	debugMetadata?: DebugMetadata | null;
	content?: AstNode[];
	[key: string]: any;
}

export class AstSerializer {
	public static serializeToJson(story: Story): string {
		const ast = AstSerializer.serializeNode(story);
		return JSON.stringify(ast, null, 2);
	}

	private static serializeNode(node: ParsedObject): AstNode {
		const result: AstNode = {
			type: node.typeName,
		};

		// Add debug metadata if present
		if (node.hasOwnDebugMetadata) {
			result.debugMetadata = node.debugMetadata;
		}

		// Add specific properties based on node type
		if (node instanceof Story) {
			result.countAllVisits = node.countAllVisits;
			result.constants = Array.from(node.constants.entries()).map(([key, value]) => ({
				name: key,
				expression: AstSerializer.serializeNode(value),
			}));
			result.externals = Array.from(node.externals.entries()).map(([key, value]) => ({
				name: key,
				declaration: AstSerializer.serializeNode(value),
			}));
		} else if (node instanceof FlowBase) {
			result.name = node.name;
			result.flowLevel = node.flowLevel;
		} else if (node instanceof Text) {
			result.text = node.text;
		} else if (node instanceof Expression) {
			// Add any Expression-specific properties
			result.expressionType = node.constructor.name;
		} else if (node instanceof ListDefinition) {
			result.identifier = node.identifier;
			result.itemDefinitions = node.itemDefinitions.map(item => ({
				name: item.name,
				seriesValue: item.seriesValue,
				explicitValue: item.explicitValue,
			}));
		} else if (node instanceof ExternalDeclaration) {
			result.name = node.name;
			result.argumentNames = node.argumentNames;
		} else if (node instanceof ConstantDeclaration) {
			result.constantName = node.constantName;
			if (node.expression) {
				result.expression = AstSerializer.serializeNode(node.expression);
			}
		}

		// Recursively process children
		if (node.content && node.content.length > 0) {
			result.content = node.content.map(child => AstSerializer.serializeNode(child));
		}

		return result;
	}
} 
