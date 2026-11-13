import {inspectionProjects,inspectProject} from '../../../../architect/inspection.mjs';
export function getStaticPaths(){return inspectionProjects.map(project=>({params:{project:project.id},props:{project}}));}
export function GET({props}){return Response.json(inspectProject(props.project));}
