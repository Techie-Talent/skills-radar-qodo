#!/usr/bin/env tsx

import { stdin, stdout, stderr } from 'process';
import readline from 'readline';

const API_BASE_URL = process.env.MCP_API_BASE_URL || 'http://localhost:3000/api/mcp';
const API_KEY = process.env.MCP_API_KEY;

interface MCPRequest {
  jsonrpc: string;
  id?: string | number;
  method: string;
  params?: any;
}

interface MCPResponse {
  jsonrpc: string;
  id: string | number | null;
  result?: any;
  error?: any;
}

class MCPStdioWrapper {
  private rl: readline.Interface;

  constructor() {
    // Don't exit immediately if no API key - let protocol methods work
    if (!API_KEY) {
      stderr.write('Warning: MCP_API_KEY not set. Tool calls will fail.\n');
    }

    this.rl = readline.createInterface({
      input: stdin,
      output: process.stdout,
      terminal: false
    });

    this.rl.on('line', this.handleLine.bind(this));
    
    // Handle process cleanup
    process.on('SIGINT', () => this.cleanup());
    process.on('SIGTERM', () => this.cleanup());
  }

  private cleanup() {
    this.rl.close();
    process.exit(0);
  }

  private async handleLine(line: string) {
    let requestId: string | number | null = null;
    
    try {
      if (!line.trim()) return; // Skip empty lines
      
      const request: MCPRequest = JSON.parse(line);
      requestId = request.id ?? null;
      
      const response = await this.handleRequest(request);
      
      // Only send response if it's not null (notifications don't need responses)
      if (response !== null) {
        stdout.write(JSON.stringify(response) + '\n');
      }
    } catch (error) {
      // Send error as proper JSON-RPC response
      const errorResponse: MCPResponse = {
        jsonrpc: '2.0',
        id: requestId,
        error: {
          code: -32700,
          message: `Parse error: ${error instanceof Error ? error.message : String(error)}`
        }
      };
      stdout.write(JSON.stringify(errorResponse) + '\n');
    }
  }

  private async handleRequest(request: MCPRequest): Promise<MCPResponse | null> {
    const { id, method, params } = request;

    try {
      switch (method) {
        case 'initialize':
          return {
            jsonrpc: '2.0',
            id: id ?? null,
            result: {
              protocolVersion: '2024-11-05',
              capabilities: {
                tools: {
                  listChanged: false
                },
                resources: {
                  subscribe: false,
                  listChanged: false
                }
              },
              serverInfo: {
                name: 'skills-radar-mcp',
                version: '1.0.0'
              }
            }
          };

        case 'notifications/initialized':
          // This is a notification, no response needed
          return null;

        case 'tools/list':
          return {
            jsonrpc: '2.0',
            id: id ?? null,
            result: {
              tools: [
                {
                  name: 'get_skills',
                  description: 'Get skills data with optional filtering by knowledge area, category, and include member information',
                  inputSchema: {
                    type: 'object',
                    properties: {
                      knowledge_area_id: { 
                        type: 'number',
                        description: 'Filter by knowledge area ID'
                      },
                      category_id: { 
                        type: 'number',
                        description: 'Filter by skill category ID'
                      },
                      include_members: { 
                        type: 'boolean',
                        description: 'Include member information for each skill'
                      },
                      limit: { 
                        type: 'number', 
                        default: 100,
                        description: 'Maximum number of results to return'
                      }
                    }
                  }
                },
                {
                  name: 'get_members',
                  description: 'Get team members with comprehensive filtering options including skills, clients, and expertise levels',
                  inputSchema: {
                    type: 'object',
                    properties: {
                      knowledge_area_id: { 
                        type: 'number',
                        description: 'Filter by knowledge area ID'
                      },
                      skill_id: { 
                        type: 'number',
                        description: 'Filter by specific skill ID'
                      },
                      current_client: { 
                        type: 'string',
                        description: 'Filter by current client assignment'
                      },
                      category: { 
                        type: 'string',
                        description: 'Filter by member category (Starter, Builder, Solver, Wizard)'
                      },
                      min_expertise_level: {
                        type: 'number',
                        description: 'Filter by minimum expertise level (1-4)'
                      },
                      include_skills: { 
                        type: 'boolean',
                        description: 'Include detailed skill information for each member'
                      },
                      include_profile: {
                        type: 'boolean',
                        description: 'Include profile information (assignments, roles, feedback)'
                      },
                      limit: { 
                        type: 'number', 
                        default: 100,
                        description: 'Maximum number of results to return'
                      }
                    }
                  }
                },
                {
                  name: 'get_dashboard_summary',
                  description: 'Get aggregated insights and analytics including team statistics, skill distributions, and top performers',
                  inputSchema: {
                    type: 'object',
                    properties: {},
                    description: 'No parameters required - returns comprehensive team analytics'
                  }
                },
                {
                  name: 'find_experts',
                  description: 'Find team members who are experts in specific technologies or skills',
                  inputSchema: {
                    type: 'object',
                    properties: {
                      skill_name: {
                        type: 'string',
                        description: 'Name of the skill to search for (e.g., "React", "Python", "AWS")'
                      },
                      min_expertise_level: {
                        type: 'number',
                        description: 'Minimum expertise level required (1-4, default: 3)',
                        default: 3
                      },
                      available_only: {
                        type: 'boolean',
                        description: 'Only show members not currently assigned to clients',
                        default: false
                      }
                    },
                    required: ['skill_name']
                  }
                }
              ]
            }
          };

        case 'tools/call':
          // Check if API key is available for tool calls
          if (!API_KEY) {
            return {
              jsonrpc: '2.0',
              id: id ?? null,
              error: {
                code: -32000,
                message: 'MCP_API_KEY environment variable is required for tool calls'
              }
            };
          }

          const toolResult = await this.callTool(params?.name, params?.arguments || {});
          return {
            jsonrpc: '2.0',
            id: id ?? null,
            result: {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(toolResult, null, 2)
                }
              ]
            }
          };

        default:
          return {
            jsonrpc: '2.0',
            id: id ?? null,
            error: {
              code: -32601,
              message: `Method not found: ${method}`
            }
          };
      }
    } catch (error) {
      return {
        jsonrpc: '2.0',
        id: id ?? null,
        error: {
          code: -32603,
          message: `Internal error: ${error instanceof Error ? error.message : String(error)}`
        }
      };
    }
  }

  private async callTool(toolName: string, args: any): Promise<any> {
    const headers = {
      'x-api-key': API_KEY!,
      'Content-Type': 'application/json'
    };

    let endpoint: string;
    let queryParams = new URLSearchParams();

    switch (toolName) {
      case 'get_skills':
        endpoint = '/skills';
        if (args.knowledge_area_id) queryParams.set('knowledge_area_id', args.knowledge_area_id);
        if (args.category_id) queryParams.set('category_id', args.category_id);
        if (args.include_members) queryParams.set('include_members', 'true');
        if (args.limit) queryParams.set('limit', args.limit);
        break;

      case 'get_members':
        endpoint = '/members';
        if (args.knowledge_area_id) queryParams.set('knowledge_area_id', args.knowledge_area_id);
        if (args.skill_id) queryParams.set('skill_id', args.skill_id);
        if (args.current_client) queryParams.set('current_client', args.current_client);
        if (args.category) queryParams.set('category', args.category);
        if (args.min_expertise_level) queryParams.set('min_expertise_level', args.min_expertise_level);
        if (args.include_skills) queryParams.set('include_skills', 'true');
        if (args.include_profile) queryParams.set('include_profile', 'true');
        if (args.limit) queryParams.set('limit', args.limit);
        break;

      case 'get_dashboard_summary':
        endpoint = '/dashboards/summary';
        break;

      case 'find_experts':
        // This is a custom tool that combines skills and members queries
        return await this.findExperts(args);

      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }

    const url = `${API_BASE_URL}${endpoint}?${queryParams}`;
    const response = await fetch(url, { headers });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
    }

    return await response.json();
  }

  private async findExperts(args: any): Promise<any> {
    const { skill_name, min_expertise_level = 3, available_only = false } = args;

    // First, find the skill ID
    const skillsResponse = await fetch(`${API_BASE_URL}/skills`, {
      headers: { 'x-api-key': API_KEY! }
    });

    if (!skillsResponse.ok) {
      throw new Error('Failed to fetch skills');
    }

    const skillsData = await skillsResponse.json();
    const skill = skillsData.data.find((s: any) => 
      s.skill_name.toLowerCase().includes(skill_name.toLowerCase())
    );

    if (!skill) {
      return {
        data: [],
        message: `No skill found matching "${skill_name}". Available skills: ${skillsData.data.slice(0, 10).map((s: any) => s.skill_name).join(', ')}...`,
        metadata: {
          search_term: skill_name,
          found_skill: false
        }
      };
    }

    // Now find members with this skill
    const queryParams = new URLSearchParams({
      skill_id: skill.skill_id.toString(),
      min_expertise_level: min_expertise_level.toString(),
      include_skills: 'true',
      limit: '50'
    });

    if (available_only) {
      queryParams.set('current_client', ''); // Filter for unassigned members
    }

    const membersResponse = await fetch(`${API_BASE_URL}/members?${queryParams}`, {
      headers: { 'x-api-key': API_KEY! }
    });

    if (!membersResponse.ok) {
      throw new Error('Failed to fetch members');
    }

    const membersData = await membersResponse.json();

    // Filter and format the results
    const experts = membersData.data
      .filter((member: any) => {
        const memberSkill = member.skills?.find((s: any) => s.skill_id === skill.skill_id);
        return memberSkill && memberSkill.expertise_level >= min_expertise_level;
      })
      .map((member: any) => {
        const memberSkill = member.skills.find((s: any) => s.skill_id === skill.skill_id);
        return {
          member_name: member.full_name,
          member_email: member.email,
          current_client: member.current_client || 'Available',
          category: member.category,
          expertise_level: memberSkill.expertise_level,
          expertise_description: memberSkill.expertise_description,
          assessment_date: memberSkill.assessment_date
        };
      });

    return {
      data: experts,
      metadata: {
        search_term: skill_name,
        found_skill: skill.skill_name,
        skill_id: skill.skill_id,
        min_expertise_level,
        available_only,
        total_experts: experts.length
      }
    };
  }
}

// Start the wrapper
new MCPStdioWrapper();