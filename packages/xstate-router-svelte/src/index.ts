import {selectBase,createRouterMachineFactory} from "@tkvw/xstate-router";
import {useSelector} from "@xstate/svelte"
import {ActorLogicFrom, ActorRefFrom, ActorLogic} from "xstate";

type TRouterMachine = ReturnType<ReturnType<typeof createRouterMachineFactory>['createRouterMachine']>;


export function createSelectors<TActor extends ActorRefFrom<TRouterMachine> >(actorRef: ActorRefFrom<TMachine> ){
    return {
        base: useSelector(actorRef,x => x.c)
    }
}