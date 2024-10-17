/// <reference types="react" />
import { supercluster as Supercluster } from 'react-native-clusterer';
import { MapMarkerProps, Region } from 'react-native-maps';
import { EasingFunction, EasingFunctionFactory } from 'react-native-reanimated';
interface LatLng {
    latitude: number;
    longitude: number;
    longitudeDelta?: number;
    latitudeDelta?: number;
}
export interface AnimateOptions extends LatLng {
    duration?: number;
    easing?: EasingFunction | EasingFunctionFactory;
}
export declare const useAnimatedRegion: (location?: Partial<LatLng>) => {
    props: Partial<{
        coordinate: {
            latitude: number;
            longitude: number;
            latitudeDelta: number;
            longitudeDelta: number;
        };
    }>;
    animate: (options: AnimateOptions) => void;
};
export type MarkerProps = Omit<MapMarkerProps, 'coordinate'> & {
    coordinate?: MapMarkerProps['coordinate'];
};
export declare const AnimatedMarker: import("react").ComponentClass<import("react-native-reanimated").AnimateProps<MarkerProps>, any>;
export type IFeature = Supercluster.PointOrClusterFeature<any, any>;
export type AnimatedClustersHookProps = {
    featuresToDisplay: IFeature[];
    mapDimensions: {
        width: number;
        height: number;
    };
    region: Region;
} & Supercluster.Options<any, any>;
export declare const useAnimatedClusters: ({ featuresToDisplay, mapDimensions, region, ...options }: AnimatedClustersHookProps) => (Supercluster.PointFeature<any> | Supercluster.ClusterFeature<Supercluster.AnyProps>)[];
export {};
/**
 * test if the clusters are same
 * @param currentClusters
 * @param nextClusters
 */
